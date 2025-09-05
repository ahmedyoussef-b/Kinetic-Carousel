// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { SafeUser } from '@/types';

export async function POST(request: NextRequest) {
  console.log("--- 🚀 API: Tentative de connexion via le backend ---");
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ message: "Le token ID est manquant." }, { status: 400 });
    }

    const admin = await initializeFirebaseAdmin();
    const auth = admin.auth();
    
    console.log("🔍 [API/login] Vérification du token ID Firebase...");
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log(`✅ [API/login] Token ID vérifié pour UID: ${decodedToken.uid}`);

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!user) {
      console.error(`❌ [API/login] Utilisateur non trouvé dans la base de données pour UID: ${decodedToken.uid}`);
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
    }

    console.log(`[API/login] Création du cookie de session...`);
    // Durée de validité du cookie de session (ex: 7 jours)
    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    console.log(`✅ [API/login] Cookie de session créé.`);

    // Create a safe user object without the password
    const safeUser: SafeUser = {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        img: user.img,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        twoFactorEnabled: user.twoFactorEnabled,
    };

    const response = NextResponse.json({ user: safeUser });

    console.log(`[API/login] Définition du cookie de session dans la réponse...`);
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ [API/login] Erreur de connexion:', error);
    return NextResponse.json({ message: "L'authentification a échoué." }, { status: 401 });
  }
}
