// src/app/api/notifications/read/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { NotificationService } from '@/services/notification-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Marquer toutes les notifications comme lues
      await NotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, message: 'Toutes les notifications marquées comme lues.' }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ message: 'ID de notification requis' }, { status: 400 });
    }

    // Marquer une notification spécifique comme lue
    await NotificationService.markAsRead(notificationId);
    return NextResponse.json({ success: true, message: 'Notification marquée comme lue.' }, { status: 200 });

  } catch (error) {
    console.error('[API/notifications/read POST] Erreur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}