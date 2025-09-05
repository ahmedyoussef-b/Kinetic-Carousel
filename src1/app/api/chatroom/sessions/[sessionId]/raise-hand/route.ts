// src/app/api/chatroom/sessions/[sessionId]/raise-hand/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;
  const { action } = await request.json(); // 'raise' or 'lower'

  if (!action || (action !== 'raise' && action !== 'lower')) {
    return NextResponse.json({ message: 'Action invalide' }, { status: 400 });
  }

  try {
    const session = SessionService.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée' }, { status: 404 });
    }
    
    // Use the service to update the hand raise status
    SessionService.updateHandRaise(sessionId, sessionInfo.user.id, action);
    
    // Return the updated session state
    const updatedSession = SessionService.getSession(sessionId);

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour de la levée de main pour la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
