// src/app/api/presence/update/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { PresenceService } from '@/services/presence-service';

export async function POST(request: NextRequest) {
  console.log("📥 [API/Presence] POST request received.");
  const session = await getServerSession();
  if (!session?.user?.id) {
    console.warn("⚠️ [API/Presence] Unauthorized POST: No user ID in session.");
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    console.log(`👤 [API/Presence] Received status '${status}' for user ${session.user.id}`);

    if (status !== 'online' && status !== 'offline') {
      console.warn(`⚠️ [API/Presence] Invalid status received: ${status}`);
      return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
    }

    PresenceService.updateUserStatus(session.user.id, status);
    
    return NextResponse.json({ success: true, onlineUsers: PresenceService.getOnlineUserIds() });
  } catch (error) {
    console.error("❌ [API/Presence] POST Error:", error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
    console.log("📤 [API/Presence] GET request received.");
    const session = await getServerSession();
    if (!session?.user?.id) {
        console.warn("⚠️ [API/Presence] Unauthorized GET: No user ID in session.");
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const onlineUserIds = PresenceService.getOnlineUserIds();
    console.log(`✅ [API/Presence] Responding with ${onlineUserIds.length} online users:`, onlineUserIds);

    return NextResponse.json({ onlineUserIds });
}
