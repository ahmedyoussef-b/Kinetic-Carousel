// src/app/api/chatroom/sessions/[sessionId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import type { ChatroomSession, SessionParticipant, User, ChatroomMessage } from '@prisma/client';

// Define a type that includes the relations you are fetching
type ChatroomSessionWithRelations = ChatroomSession & {
  participants: (SessionParticipant & { user: User })[];
  messages: ChatroomMessage[];
};

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;

  try {
    const session = await prisma.chatroomSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        participants: { // Include the participants
          include: { // Include the user within participants
            user: true,
          },
        },
      },
    }) as ChatroomSessionWithRelations | null; // Explicitly cast the result

    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée' }, { status: 404 });
    }

    // Security check: Ensure the requesting user is the host or a participant
    const isHost = session.hostId === sessionInfo.user.id;
    const isParticipant = session.participants.some(p => p.userId === sessionInfo.user.id);
    if (!isHost && !isParticipant) {
        return NextResponse.json({ message: 'Accès interdit à cette session' }, { status: 403 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
