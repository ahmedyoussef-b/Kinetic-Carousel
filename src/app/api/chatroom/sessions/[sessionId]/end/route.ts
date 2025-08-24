// src/app/api/chatroom/sessions/[sessionId]/end/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;

  try {
    // First, check the database session for ownership
    const dbSession = await prisma.chatroomSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      return NextResponse.json({ message: 'Session non trouvée' }, { status: 404 });
    }

    // Security check: Only the host can end the session
    if (dbSession.hostId !== sessionInfo.user.id) {
        return NextResponse.json({ message: 'Seul l\'hôte peut terminer la session' }, { status: 403 });
    }

    // End the session in the in-memory service
    const endedSession = SessionService.endSession(sessionId);
    if (!endedSession) {
        // If it was already ended in memory, that's okay, but we still update the DB.
        console.warn(`[API] Session ${sessionId} non trouvée dans le service en mémoire, mais fin de la session demandée.`);
    }

    // Finally, update the database record
    const updatedDbSession = await prisma.chatroomSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endTime: new Date(),
      },
    });

    return NextResponse.json(updatedDbSession, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la fin de la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
