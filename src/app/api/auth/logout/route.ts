// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function POST() {
    console.log("--- 🚀 API: Tentative de Déconnexion ---");

    try {
        const response = NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });

        // Invalidate the cookie by setting its expiration date to the past
        console.log("🍪 [API/logout] Invalidation du cookie de session.");
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: "", // Set value to empty
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: -1, // Expire immediately
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("❌ [API/logout] Erreur de l'API de déconnexion:", error);
        return NextResponse.json({ message: 'Une erreur interne est survenue lors de la déconnexion.' }, { status: 500 });
    }
}
