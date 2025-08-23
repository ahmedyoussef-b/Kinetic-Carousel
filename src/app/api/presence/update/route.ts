// src/app/api/presence/update/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { PresenceService } from '@/services/presence-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    if (status !== 'online' && status !== 'offline') {
      return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
    }

    PresenceService.updateUserStatus(session.user.id, status);
    
    // Log the current state for debugging
    console.log(`[API Presence] User ${session.user.id} set to ${status}. Current online users: ${PresenceService.getOnlineUserIds().length}`);

    return NextResponse.json({ success: true, onlineUsers: PresenceService.getOnlineUserIds() });
  } catch (error) {
    console.error('[API Presence POST] Error:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const onlineUserIds = PresenceService.getOnlineUserIds();
    // Log for debugging
    console.log(`[API Presence GET] Responding with ${onlineUserIds.length} online users.`);

    return NextResponse.json({ onlineUserIds });
}
