// src/app/api/video/token/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Twilio from 'twilio';
import { getServerSession } from '@/lib/auth-utils';

const { AccessToken } = Twilio.jwt;
const { VideoGrant } = AccessToken;

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const identity = session.user.name || session.user.email;
    if (!identity) {
        return NextResponse.json({ message: 'Identité utilisateur non trouvée dans la session' }, { status: 400 });
    }

    const { room } = await req.json();

    if (!room) {
        return NextResponse.json({ message: 'Nom de la salle requis' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
        console.error("Les variables d'environnement Twilio ne sont pas configurées.");
        return NextResponse.json({ message: 'Configuration du serveur incomplète' }, { status: 500 });
    }
    
    // FIX: Pass identity inside an options object as the fourth argument.
    // Also added a Time-to-Live (ttl) of 1 hour as a good practice.
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
      ttl: 3600 // 1 hour
    });
    
    const videoGrant = new VideoGrant({ room });
    accessToken.addGrant(videoGrant);

    return NextResponse.json({ token: accessToken.toJwt() });
}
