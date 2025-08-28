// src/app/api/video/token/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Twilio from 'twilio';
import { getServerSession } from '@/lib/auth-utils';

const { AccessToken } = Twilio.jwt;
const { VideoGrant } = AccessToken;

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    
    const { roomName } = await req.json();

    if (!roomName) {
        return NextResponse.json({ message: 'Le nom de la salle est requis' }, { status: 400 });
    }
    
    const identity = session.user.id;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
        console.error("Les variables d'environnement Twilio ne sont pas configurées.");
        return NextResponse.json({ message: 'Configuration du serveur incomplète' }, { status: 500 });
    }
    
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, { identity });
    
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    accessToken.addGrant(videoGrant);

    return NextResponse.json({ token: accessToken.toJwt() });
}
