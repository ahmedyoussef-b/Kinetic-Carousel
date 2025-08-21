// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/formValidationSchemas';
import { Role } from '@/types';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRATION_TIME = '1h';

export async function POST(req: NextRequest) {
    console.log("--- 🚀 API: Tentative de Connexion ---");
    if (!JWT_SECRET) {
        console.error("❌ [API/login] JWT_SECRET n'est pas défini.");
        return NextResponse.json({ message: "Erreur de configuration du serveur." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            console.log("🚫 [API/login] Données invalides.", validation.error.errors);
            return NextResponse.json({ message: "Données invalides.", errors: validation.error.errors }, { status: 400 });
        }

        const { email, password } = validation.data;
        console.log(`👤 [API/login] Tentative de connexion pour: ${email}`);
        
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) {
            console.log("🚫 [API/login] Utilisateur non trouvé.");
            return NextResponse.json({ message: "Email ou mot de passe incorrect." }, { status: 401 });
        }
        console.log("✅ [API/login] Utilisateur trouvé.");

        if (!user.password) {
            console.log("🚫 [API/login] Le mot de passe de l'utilisateur n'est pas défini (peut-être une connexion sociale ?).");
            return NextResponse.json({ message: "Email ou mot de passe incorrect." }, { status: 401 });
        }

        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (compareError) {
            console.error("❌ [API/login] Erreur lors de la comparaison bcrypt :", compareError);
            // Retourne une erreur 500 car c'est un problème serveur inattendu
            return NextResponse.json({ message: "Erreur lors de la vérification des identifiants." }, { status: 500 });
        }

        if (!isPasswordValid) {
            console.log("🔑 [API/login] Mot de passe invalide.");
            return NextResponse.json({ message: "Email ou mot de passe incorrect." }, { status: 401 });
        }
        console.log("🔑 [API/login] Mot de passe valide.");
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...safeUser } = user;

        const tokenPayload = {
            userId: safeUser.id,
            role: safeUser.role,
            email: safeUser.email,
            name: safeUser.name,
            img: safeUser.img,
        };
        
        console.log("✅ [API/login] Connexion réussie. Génération du JWT.");
        const finalToken = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        });
        
        const response = NextResponse.json({ user: safeUser }, { status: 200 });
        
        console.log("🍪 [API/login] Création du cookie de session avec sameSite=none et secure=true.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: finalToken,
            httpOnly: true,
            secure: true, 
            sameSite: 'none', 
            maxAge: 60 * 60 * 24, // 1 jour
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("❌ [API/login] Erreur interne de l'API de connexion :", error);
        return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
    }
}
