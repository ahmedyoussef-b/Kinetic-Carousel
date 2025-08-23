// src/app/api/presence/update/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { Role } from '@/types';

// In-memory store for presence status. In a real production app, use a database or a service like Redis.
const presenceStore = new Map<string, { status: 'online' | 'offline'; lastSeen: number }>();

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { status } = await request.json();

  if (status !== 'online' && status !== 'offline') {
    return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
  }

  presenceStore.set(session.user.id, { status, lastSeen: Date.now() });
  
  // Clean up old entries periodically (optional but good practice)
  for (const [userId, data] of presenceStore.entries()) {
      if (Date.now() - data.lastSeen > 1000 * 60 * 10) { // 10 minutes timeout
          presenceStore.delete(userId);
      }
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const onlineUserIds = Array.from(presenceStore.entries())
        .filter(([, data]) => data.status === 'online')
        .map(([userId]) => userId);

    return NextResponse.json({ onlineUserIds });
}
