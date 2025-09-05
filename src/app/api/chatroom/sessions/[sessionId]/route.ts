'use server';
// src/app/api/chatroom/sessions/[sessionId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';
import { SessionParticipant } from '@/lib/redux/slices/session/types';

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  // Pass the request object to getServerSession for correct session retrieval in API routes.
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user?.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;

  try {
    // FIX: Await the async getSession call
    let session = await SessionService.getSession(sessionId);

    // If session is not in memory, try to recreate it from DB
    if (!session) {
        session = await SessionService.recreateSessionFromDb(sessionId);
    }
    
    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée ou terminée' }, { status: 404 });
    }

    // Security check: Ensure the requesting user is a participant
    const isParticipant = session.participants.some((p: SessionParticipant) => p.id === sessionInfo.user.id);
    if (!isParticipant) {
        return NextResponse.json({ message: 'Accès interdit à cette session' }, { status: 403 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
