// src/app/api/notifications/all/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { NotificationService } from '@/services/notification-service';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const notifications = await NotificationService.getAllNotifications(session.user.id, limit);
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('[API/notifications/all GET] Erreur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}