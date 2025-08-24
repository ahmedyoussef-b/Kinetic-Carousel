// src/app/api/chatroom/sessions/[sessionId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import type { ChatroomSession, SessionParticipant as PrismaSessionParticipant, User, ChatroomMessage } from '@prisma/client';
import { SessionParticipant } from '@/lib/redux/slices/session/types';
import { Role } from '@/types';

// Define a type that includes the relations you are fetching
type ChatroomSessionWithRelations = ChatroomSession & {
  participants: (PrismaSessionParticipant & { user: User })[];
  messages: (ChatroomMessage & { author: User })[];
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
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        participants: { 
          include: { user: true },
        },
      },
    }) as ChatroomSessionWithRelations | null; 

    if (!session) {
      return NextResponse.json({ message: 'Session non trouvée' }, { status: 404 });
    }

    // Security check: Ensure the requesting user is the host or a participant
    const isHost = session.hostId === sessionInfo.user.id;
    const isParticipant = session.participants.some(p => p.userId === sessionInfo.user.id);
    if (!isHost && !isParticipant) {
        return NextResponse.json({ message: 'Accès interdit à cette session' }, { status: 403 });
    }

    // --- FIX: Remap participants to ensure `id` field is present ---
    const formattedParticipants: SessionParticipant[] = session.participants.map(p => ({
      id: p.userId, // This is the crucial fix
      userId: p.userId,
      name: p.user.name || 'Participant',
      email: p.user.email || 'N/A',
      role: p.user.role as Role,
      img: p.user.img,
      isOnline: false, // Presence should be updated by the client
      isInSession: true,
      points: 0, 
      badges: [], 
    }));

    // Reconstruct the session object with the corrected participant data
    const formattedSession = {
      ...session,
      participants: formattedParticipants,
      // Map messages to include author details correctly
      messages: session.messages.map(msg => ({
        ...msg,
        author: {
          id: msg.author.id,
          name: msg.author.name,
          email: msg.author.email,
          role: msg.author.role,
          img: msg.author.img,
        }
      }))
    };


    return NextResponse.json(formattedSession, { status: 200 });
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de la session ${sessionId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
