// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    console.log("--- 🚀 API: Tentative de connexion /api/auth/login ---");
    try {
        const body = await req.json();
        const { idToken } = body;

        if (!idToken) {
            console.warn("🚫 [API/Login] Le jeton ID est manquant dans la requête.");
            return NextResponse.json({ message: "ID token is required." }, { status: 400 });
        }
        
        console.log("🔑 [API/Login] Jeton reçu:", idToken?.substring(0, 50) + '...');
        console.log('🛠️ [API/Login]  Configuration Admin:', {
          hasAdmin: !!adminAuth,
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        console.log("🔍 [API/Login] Vérification du jeton ID Firebase...");
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log(`✅ [API/Login] Jeton vérifié pour UID: ${decodedToken.uid}, Email: ${decodedToken.email}`);
        
        // --- Logique personnalisée : Synchronisation avec la DB locale ---
        console.log(`👤 [API/Login] Recherche de l'utilisateur ${decodedToken.uid} dans la base de données Prisma...`);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.uid },
            select: { role: true, active: true }
        });
        
        if (!user) {
            console.error(`🚫 [API/Login] Utilisateur avec UID ${decodedToken.uid} non trouvé dans la base de données.`);
            return NextResponse.json({ message: "User profile not found in system." }, { status: 404 });
        }

        if (!user.active) {
            console.warn(`🚫 [API/Login] Le compte pour l'utilisateur ${decodedToken.uid} est désactivé.`);
            return NextResponse.json({ message: "Your account has been deactivated." }, { status: 403 });
        }
        console.log(`✅ [API/Login] Utilisateur trouvé et actif. Rôle : ${user.role}`);
        
        // --- Création du Cookie de Session ---
        // Durée de la session : 5 jours.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        console.log("🍪 [API/Login] Création du cookie de session...");
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ status: 'success', message: 'Logged in successfully.' }, { status: 200 });

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
        console.error("❌ [API/Login] Erreur d'authentification Firebase:", error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        return NextResponse.json({ message: 'Authentication failed.', error: error.message }, { status: 401 });
    }
}
