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
        
        // --- PRISMA BYPASS ---
        // This simulates a successful user lookup without hitting the database.
        const user: SafeUser = {
          id: decodedToken.uid,
          email: decodedToken.email || 'no-email@example.com',
          name: decodedToken.name || 'Test User',
          firstName: decodedToken.name?.split(' ')[0] || 'Test',
          lastName: decodedToken.name?.split(' ')[1] || 'User',
          username: decodedToken.email || `user_${decodedToken.uid.substring(0,5)}`,
          role: decodedToken.role as Role || Role.ADMIN, // Default to ADMIN for testing
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          img: decodedToken.picture || null,
          twoFactorEnabled: false,
        };
        console.log(`✅ [API/Login] Utilisateur simulé. Rôle : ${user.role}`);
        // --- END PRISMA BYPASS ---
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        console.log("🍪 [API/Login] Création du cookie de session...");
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ 
            status: 'success', 
            message: 'Authentification réussie',
            user: user
        }, { status: 200 });

        console.log("✅ [API/Login] Cookie de session créé. Envoi de la réponse au client.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            httpOnly: true,
            secure: true, // Always true for SameSite=None
            sameSite: 'none', // Changed to 'none' for cross-site dev environments
            maxAge: expiresIn,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error("❌ [API/Login] Erreur d'authentification:", error.message);
        return NextResponse.json({ message: 'Authentication failed.', error: error.message }, { status: 401 });
    }
}
