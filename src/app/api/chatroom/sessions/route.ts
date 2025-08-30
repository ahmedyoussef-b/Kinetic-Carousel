// src/app/api/chatroom/sessions/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { ActiveSession, SessionType } from '@/lib/redux/slices/session/types';
import { SessionService } from '@/services/session-service';

export async function POST(request: NextRequest) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  // Expect the full initial session object from the client
  const initialSessionData: Partial<ActiveSession> = await request.json();

  const { title, sessionType, classId, participants, quizzes, polls } = initialSessionData;

  if (!title || !sessionType || !participants || !Array.isArray(participants)) {
    return NextResponse.json({ message: 'Données de session invalides' }, { status: 400 });
  }

  try {
    const hostId = sessionInfo.user.id;

    // Create the session in the database first
    const newDbSession = await prisma.chatroomSession.create({
      data: {
        title,
        type: sessionType,
        hostId,
        classId: sessionType === 'CLASS' && classId ? parseInt(classId, 10) : null,
        participants: {
          create: participants
            .filter((p) => p.userId !== hostId) // FIX: Exclude the host from the participants list to prevent DB conflict
            .map((p) => ({ userId: p.userId! })),
        },
      },
      include: {
        participants: { include: { user: true } },
      }
    });

    // Now, create the full ActiveSession object for our in-memory service
    const activeSession: ActiveSession = {
        id: newDbSession.id,
        hostId: newDbSession.hostId,
        sessionType: newDbSession.type as SessionType,
        classId: newDbSession.classId ? String(newDbSession.classId) : '',
        className: newDbSession.title,
        participants: participants,
        startTime: newDbSession.startTime.toISOString(),
        raisedHands: [],
        reactions: [],
        polls: polls || [],
        activePoll: undefined,
        quizzes: quizzes || [],
        activeQuiz: undefined,
        rewardActions: [],
        classTimer: null,
        spotlightedParticipantId: null,
        breakoutRooms: null,
        breakoutTimer: null,
        messages: [],
        title: title
    };
    
    // Store the active session in the in-memory service
    await SessionService.createSession(activeSession);

    return NextResponse.json(activeSession, { status: 201 });
  } catch (error) {
    console.error('[API] Erreur lors de la création de la session:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
