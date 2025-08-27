// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { Role } from '@/types';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    console.log("--- 🚀 API: Firebase Login Attempt ---");
    try {
        const body = await req.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ message: "ID token is required." }, { status: 400 });
        }
        
        const adminInstance = await initializeFirebaseAdmin();
        const auth = adminInstance.auth();

        // Firebase Admin SDK will verify the ID token. If invalid, it throws an error.
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log(`✅ ID token verified for UID: ${decodedToken.uid}`);
        
        // --- Custom Logic: Sync with local DB ---
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.uid },
            select: { role: true, active: true }
        });
        
        if (!user) {
            console.error(`🚫 User with UID ${decodedToken.uid} not found in our database.`);
            return NextResponse.json({ message: "User profile not found in system." }, { status: 404 });
        }

        if (!user.active) {
            return NextResponse.json({ message: "Your account has been deactivated." }, { status: 403 });
        }
        
        // --- Session Cookie Creation ---
        // Set session expiration to 5 days.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        // Create the session cookie. This will also manage existing sessions.
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ status: 'success', message: 'Logged in successfully.' }, { status: 200 });

        console.log("🍪 Session cookie created.");
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
        console.error("❌ Firebase Login API Error:", error.message);
        return NextResponse.json({ message: 'Authentication failed.', error: 'Firebase authentication failed' }, { status: 401 });
    }
}
