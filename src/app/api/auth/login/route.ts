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
    console.log("--- 🚀 API: Login Attempt ---");
    if (!JWT_SECRET) {
        console.error("❌ JWT_SECRET is not defined.");
        return NextResponse.json({ message: "Erreur de configuration du serveur." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: "Données invalides.", errors: validation.error.errors }, { status: 400 });
        }

        const { email, password } = validation.data;
        console.log(`👤 Tentative de connexion pour: ${email}`);
        
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) {
            console.log("🚫 Utilisateur non trouvé.");
            return NextResponse.json({ message: "Email ou mot de passe incorrect." }, { status: 401 });
        }
        console.log("✅ Utilisateur trouvé.");

        if (user.password === null) {
            console.log("🚫 Mot de passe utilisateur non défini.");
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password as string);

        if (!isPasswordValid) {
            console.log("🔑 Mot de passe invalide.");
            return NextResponse.json({ message: "Email ou mot de passe incorrect." }, { status: 401 });
        }
        console.log("🔑 Mot de passe valide.");
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...safeUser } = user;

        const tokenPayload = {
            userId: safeUser.id,
            role: safeUser.role,
            email: safeUser.email,
            name: safeUser.name,
            img: safeUser.img,
        };
        
        console.log("✅ Connexion réussie. Génération du JWT final.");
        const finalToken = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        });
        
        const response = NextResponse.json(safeUser, { status: 200 });

        console.log("🍪 Cookie de session créé.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: finalToken,
            httpOnly: true,
            secure: true, // Forcer à true pour la compatibilité cross-origin
            sameSite: 'none', // Forcer à 'none' pour la compatibilité cross-origin (iframe)
            maxAge: 60 * 60 * 24, // 1 jour
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.riadh5college.netlify.app' : undefined
        });

        return response;

    } catch (error) {
        console.error("❌ Erreur de l'API de connexion:", error);
        return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
    }
}
