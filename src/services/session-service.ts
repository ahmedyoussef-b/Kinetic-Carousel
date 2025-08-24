// src/services/session-service.ts

// This is a simple in-memory implementation for demonstration purposes.
// In a production environment, this should be replaced with a persistent, scalable solution
// like Redis, a database (e.g., Prisma with PostgreSQL), or a real-time service
// like Firebase Realtime Database.

import type { ActiveSession } from '@/lib/redux/slices/session/types';

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

  public endSession(sessionId: string): ActiveSession | undefined {
    const session = sessionStore.get(sessionId);
    if (session) {
      session.status = 'ENDED';
      session.endTime = new Date().toISOString();
      // In a real scenario, you might move this to a different store or DB table
      // for historical records. For now, we'll just update its status.
      console.log(`🏁 [SessionService] Session ended: ${sessionId}`);
      return session;
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

}

// Singleton pattern for development to prevent re-initialization on hot reloads
declare global {
  var sessionService: SessionServiceController | undefined;
}

export const SessionService = global.sessionService || new SessionServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.sessionService = SessionService;
}
