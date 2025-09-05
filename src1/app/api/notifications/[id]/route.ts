// src/app/api/notifications/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { NotificationService } from '@/services/notification-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = params;
    
    await NotificationService.deleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notification supprimée.' }, { status: 200 });

  } catch (error) {
    console.error('[API/notifications/[id] DELETE] Erreur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}