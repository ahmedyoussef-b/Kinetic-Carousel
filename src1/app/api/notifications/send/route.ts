// src/app/api/notifications/send/route.ts
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
    const { recipientId, type, title, message, actionUrl } = body;

    if (!recipientId || !type || !title || !message) {
      return NextResponse.json({ message: 'Données de notification incomplètes' }, { status: 400 });
    }

    // CORRECTION: Utilisez la nouvelle méthode sendNotification
    await NotificationService.sendNotification({
      recipientId,
      type,
      title,
      message,
      actionUrl,
    });

    return NextResponse.json({ success: true, message: 'Notification envoyée avec succès.' }, { status: 200 });
  } catch (error) {
    console.error('[API/notifications/send] Erreur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}