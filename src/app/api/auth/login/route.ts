// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { SafeUser } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ message: "Le token ID est manquant." }, { status: 400 });
    }

    const admin = await initializeFirebaseAdmin();
    const auth = admin.auth();
    
    const decodedToken = await auth.verifyIdToken(idToken);

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
    }

    // Durée de validité du cookie de session (ex: 7 jours)
    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

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

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error) {
    return NextResponse.json({ message: "L'authentification a échoué." }, { status: 401 });
  }
}
