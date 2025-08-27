// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import type { SafeUser } from '@/types';
import { Role } from '@/types';

export async function POST(req: NextRequest) {
    console.log("--- 🚀 API: Tentative de connexion /api/auth/login ---");
    try {
        const admin = await initializeFirebaseAdmin();
        const adminAuth = admin.auth();

        const body = await req.json();
        const { idToken } = body;

        if (!idToken) {
            console.warn("🚫 [API/Login] Le jeton ID est manquant dans la requête.");
            return NextResponse.json({ message: "ID token is required." }, { status: 400 });
        }
        
        console.log("🔑 [API/Login] Jeton reçu:", idToken?.substring(0, 50) + '...');
        console.log("🔍 [API/Login] Vérification du jeton ID Firebase...");
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log(`✅ [API/Login] Jeton vérifié pour UID: ${decodedToken.uid}, Email: ${decodedToken.email}`);
        
        console.warn("⚠️ [API/Login] Contournement de Prisma. Création d'un utilisateur de session fictif.");
        const safeUser: SafeUser = {
            id: decodedToken.uid,
            email: decodedToken.email || 'no-email@example.com',
            name: decodedToken.name || 'Utilisateur',
            firstName: decodedToken.name?.split(' ')[0] || 'Utilisateur',
            lastName: decodedToken.name?.split(' ')[1] || '',
            username: decodedToken.email || `user_${decodedToken.uid}`,
            role: (decodedToken.role as Role) || Role.ADMIN,
            active: true,
            img: decodedToken.picture || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            twoFactorEnabled: false,
        };
        console.log(`✅ [API/Login] Utilisateur fictif créé. Rôle : ${safeUser.role}`);
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        console.log("🍪 [API/Login] Création du cookie de session...");
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ 
            status: 'success', 
            message: 'Authentification réussie',
            user: safeUser
        }, { status: 200 });

        console.log("✅ [API/Login] Cookie de session créé. Envoi de la réponse au client.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expiresIn,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error("❌ [API/Login] Erreur d'authentification:", error.message);
        return NextResponse.json({ message: 'Authentication failed.', error: error.message }, { status: 401 });
    }
}
