// src/app/api/chatroom/sessions/[sessionId]/messages/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';
import type { ChatroomMessage } from '@/lib/redux/slices/session/types';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  const { sessionId } = params;
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ message: 'Le contenu du message est requis' }, { status: 400 });
  }

  try {
    const session = await SessionService.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée ou terminée' }, { status: 404 });
    }

    // Check if the user is a participant of the session
    const isParticipant = session.participants.some(p => p.id === sessionInfo.user.id);
    if (!isParticipant) {
      return NextResponse.json({ message: 'Vous ne faites pas partie de cette session' }, { status: 403 });
    }
    
    const dbMessage = await prisma.chatroomMessage.create({
        data: {
            content: content,
            authorId: sessionInfo.user.id,
            chatroomSessionId: sessionId
        },
        include: {
            author: true
        }
    });

    const newMessage: ChatroomMessage = {
      id: dbMessage.id.toString(),
      content: dbMessage.content,
      authorId: dbMessage.authorId,
      chatroomSessionId: dbMessage.chatroomSessionId,
      createdAt: dbMessage.createdAt.toISOString(),
      author: dbMessage.author,
    };
    
    // Add the message to the in-memory session state
    await SessionService.addMessage(sessionId, newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error(`[API] Erreur lors de la création du message pour la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
