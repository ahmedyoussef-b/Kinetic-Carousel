// src/app/api/notifications/count/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { NotificationService } from '@/services/notification-service';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const count = await NotificationService.getUnreadCount(session.user.id);
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('[API/notifications/count GET] Erreur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}