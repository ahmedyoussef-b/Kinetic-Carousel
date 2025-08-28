// src/app/api/video/token/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Twilio from 'twilio';
import { getServerSession } from '@/lib/auth-utils';

const { AccessToken } = Twilio.jwt;
const { VideoGrant } = AccessToken;

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        console.error("❌ [API/video/token] Accès non autorisé : aucune session utilisateur trouvée.");
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    
    const { roomName } = await req.json();

    if (!roomName) {
        return NextResponse.json({ message: 'Le nom de la salle est requis' }, { status: 400 });
    }
    
    // Utiliser l'ID de l'utilisateur de la session comme identité pour Twilio
    const identity = session.user.id;
    console.log(`✅ [API/video/token] Génération du jeton pour l'identité: ${identity} et la salle: ${roomName}`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
        console.error("❌ [API/video/token] Les variables d'environnement Twilio ne sont pas configurées.");
        return NextResponse.json({ message: 'Configuration du serveur incomplète' }, { status: 500 });
    }
    
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, { identity });
    
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    accessToken.addGrant(videoGrant);
    const jwtToken = accessToken.toJwt();
    console.log("✅ [API/video/token] Jeton Twilio généré avec succès.");

    return NextResponse.json({ token: jwtToken });
}
