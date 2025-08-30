// src/app/api/presence/update/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { PresenceService } from '@/services/presence-service';

export async function POST(request: NextRequest) {
  console.log("📥 [API/Presence] Requête POST reçue.");
  const session = await getServerSession();
  if (!session?.user?.id) {
    console.warn("⚠️ [API/Presence] POST non autorisé: Pas d'ID utilisateur dans la session.");
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    console.log(`👤 [API/Presence] Statut '${status}' reçu pour l'utilisateur ${session.user.id}`);

    if (status !== 'online' && status !== 'offline') {
      console.warn(`⚠️ [API/Presence] Statut invalide reçu: ${status}`);
      return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
    }

    await PresenceService.updateUserStatus(session.user.id, status);
    const onlineUserIds = await PresenceService.getOnlineUserIds();
    
    return NextResponse.json({ success: true, onlineUserIds });
  } catch (error) {
    console.error("❌ [API/Presence] Erreur POST:", error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
    console.log("📤 [API/Presence] Requête GET reçue.");
    const session = await getServerSession();
    if (!session?.user?.id) {
        console.warn("⚠️ [API/Presence] GET non autorisé: Pas d'ID utilisateur dans la session.");
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const onlineUserIds = await PresenceService.getOnlineUserIds();
    console.log(`✅ [API/Presence] Réponse avec ${onlineUserIds.length} utilisateurs en ligne:`, onlineUserIds);

    return NextResponse.json({ onlineUserIds });
}
