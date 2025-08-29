// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
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
        
        console.log(`📦 [API/Login] Recherche de l'utilisateur dans Prisma pour l'UID: ${decodedToken.uid}`);
        const user = await prisma.user.findUnique({
          where: { id: decodedToken.uid },
        });

        if (!user) {
          console.error(`❌ [API/Login] Utilisateur non trouvé dans Prisma pour l'UID: ${decodedToken.uid}`);
          return NextResponse.json({ message: "Profil utilisateur non trouvé dans notre base de données." }, { status: 404 });
        }
        console.log(`✅ [API/Login] Utilisateur trouvé. Rôle : ${user.role}`);
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        console.log("🍪 [API/Login] Création du cookie de session...");
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ 
            status: 'success', 
            message: 'Authentification réussie',
            user: user as SafeUser 
        }, { status: 200 });

        console.log("✅ [API/Login] Cookie de session créé. Envoi de la réponse au client.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            httpOnly: true,
            secure: true, // Requis pour SameSite=None
            sameSite: 'none', // Changé de 'lax' à 'none'
            maxAge: expiresIn,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error("❌ [API/Login] Erreur d'authentification:", error.message);
        return NextResponse.json({ message: 'Authentication failed.', error: error.message }, { status: 401 });
    }
}
