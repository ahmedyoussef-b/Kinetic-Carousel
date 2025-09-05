// src/app/api/auth/logout/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function POST(req: NextRequest) {
    console.log("--- 🚀 API: Firebase Logout ---");

    try {
        const cookieStore = cookies();
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

        // Invalidate the cookie by setting its expiration date to the past
        console.log("🍪 [API/logout] Invalidating session cookie.");
        cookieStore.delete(SESSION_COOKIE_NAME);

        return response;

    } catch (error) {
        console.error("❌ [API/logout] Logout API Error:", error);
        return NextResponse.json({ message: 'Internal server error during logout.' }, { status: 500 });
    }
}
