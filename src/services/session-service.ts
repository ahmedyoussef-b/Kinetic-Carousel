// src/services/session-service.ts

// This is a simple in-memory implementation for demonstration purposes.
// In a production environment, this should be replaced with a persistent, scalable solution
// like Redis, a database (e.g., Prisma with PostgreSQL), or a real-time service
// like Firebase Realtime Database.

import type { ActiveSession, Poll, Quiz, Reaction, RewardAction, SessionParticipant } from '@/lib/redux/slices/session/types';
import prisma from '@/lib/prisma';
import { Role } from '@/types';

// In-memory store for active sessions, keyed by session ID.
const sessionStore = new Map<string, ActiveSession>();

class SessionServiceController {
  constructor() {
    console.log("✅ [SessionService] Service initialized.");
  }

  public createSession(session: ActiveSession): ActiveSession {
    sessionStore.set(session.id, session);
    console.log(`🚀 [SessionService] Session created: ${session.id} for class ${session.className}`);
    return session;
  }

  public getSession(sessionId: string): ActiveSession | undefined {
    return sessionStore.get(sessionId);
  }

  public async recreateSessionFromDb(sessionId: string): Promise<ActiveSession | null> {
    console.log(`🔄 [SessionService] Attempting to recreate session ${sessionId} from DB.`);
    const dbSession = await prisma.chatroomSession.findUnique({
      where: { id: sessionId, status: 'ACTIVE' },
      include: {
        participants: { include: { user: true } },
        host: true,
        messages: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      }
    });

    if (!dbSession || !dbSession.host) {
      console.warn(`[SessionService] Session ${sessionId} not found in DB or has no host.`);
      return null;
    }

    const participants: SessionParticipant[] = dbSession.participants.map(p => ({
      id: p.userId,
      userId: p.userId,
      name: p.user.name || p.user.email,
      email: p.user.email,
      role: p.user.role as Role,
      img: p.user.img,
      isOnline: false, // Will be updated by presence service
      isInSession: true,
      points: 0,
      badges: [],
      isMuted: false,
    }));

    const recreatedSession: ActiveSession = {
      id: dbSession.id,
      hostId: dbSession.hostId,
      sessionType: dbSession.type as 'class' | 'meeting',
      classId: dbSession.classId ? String(dbSession.classId) : '',
      className: dbSession.title,
      title: dbSession.title,
      participants,
      startTime: dbSession.startTime.toISOString(),
      raisedHands: [],
      reactions: [],
      polls: [],
      quizzes: [],
      rewardActions: [],
      classTimer: null,
      spotlightedParticipantId: null,
      breakoutRooms: null,
      breakoutTimer: null,
      messages: dbSession.messages.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        author: {
          id: m.author.id,
          name: m.author.name,
          email: m.author.email,
          img: m.author.img,
          role: m.author.role as Role,
        }
      })),
    };

    sessionStore.set(sessionId, recreatedSession);
    console.log(`✅ [SessionService] Session ${sessionId} successfully recreated and cached.`);
    return recreatedSession;
  }
  
  public findSessionIdForParticipant(userId: string): string | null {
    for (const [sessionId, session] of sessionStore.entries()) {
      if (session.participants.some(p => p.id === userId)) {
        return sessionId;
      }
    }
    return null;
  }

  public endSession(sessionId: string): ActiveSession | undefined {
    const session = sessionStore.get(sessionId);
    if (session) {
      // In a real app, you would persist this final state to a database.
      // For now, we'll just remove it from the active store.
      sessionStore.delete(sessionId);
      console.log(`🏁 [SessionService] Session ended and removed: ${sessionId}`);
      return session; // Return the final state before deleting
    }
    return undefined;
  }

  public updateHandRaise(sessionId: string, userId: string, action: 'raise' | 'lower'): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === userId);
    if (!participant) return;

    if (action === 'raise') {
      if (!session.raisedHands.includes(userId)) {
        session.raisedHands.push(userId);
        participant.hasRaisedHand = true;
        participant.raisedHandAt = new Date().toISOString();
        console.log(`✋ [SessionService] User ${userId} raised hand in session ${sessionId}`);
      }
    } else { // 'lower'
      session.raisedHands = session.raisedHands.filter(id => id !== userId);
      participant.hasRaisedHand = false;
      participant.raisedHandAt = undefined;
      console.log(`🤚 [SessionService] User ${userId} lowered hand in session ${sessionId}`);
    }
  }
  
  public addMessage(sessionId: string, message: any): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.messages.push(message);
    }
  }

   public updateParticipant(sessionId: string, updatedParticipant: SessionParticipant): void {
    const session = this.getSession(sessionId);
    if (session) {
      const index = session.participants.findIndex(p => p.id === updatedParticipant.id);
      if (index !== -1) {
        session.participants[index] = updatedParticipant;
      }
    }
  }
}

// Singleton pattern for development to prevent re-initialization on hot reloads
declare global {
  var sessionService: SessionServiceController | undefined;
}

export const SessionService = global.sessionService || new SessionServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.sessionService = SessionService;
}
