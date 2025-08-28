// src/app/api/video/token/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Twilio from 'twilio';

const { AccessToken } = Twilio.jwt;
const { VideoGrant } = AccessToken;

export async function POST(req: NextRequest) {
    // The user's identity is now passed in the request body for explicitness.
    // Server-side session validation should still be in place in a real app
    // via middleware or by re-verifying a token here if needed.
    const { room, identity } = await req.json();

    if (!room) {
        return NextResponse.json({ message: 'Le nom de la salle est requis' }, { status: 400 });
    }

    if (!identity) {
        return NextResponse.json({ message: 'L\'identité de l\'utilisateur est requise' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
        console.error("Les variables d'environnement Twilio ne sont pas configurées.");
        return NextResponse.json({ message: 'Configuration du serveur incomplète' }, { status: 500 });
    }
    
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, { identity });
    
    const videoGrant = new VideoGrant({ room });
    accessToken.addGrant(videoGrant);

    return NextResponse.json({ token: accessToken.toJwt() });
}
