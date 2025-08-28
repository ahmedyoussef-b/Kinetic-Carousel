'use server';
// src/app/api/chatroom/sessions/[sessionId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;

  try {
    const session = SessionService.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée ou terminée' }, { status: 404 });
    }

    // Security check: Ensure the requesting user is a participant
    const isParticipant = session.participants.some(p => p.id === sessionInfo.user.id);
    if (!isParticipant) {
        return NextResponse.json({ message: 'Accès interdit à cette session' }, { status: 403 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
