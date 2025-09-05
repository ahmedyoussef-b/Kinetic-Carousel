// src/services/session-service.ts
import redis from '@/lib/redis';
import type { ActiveSession, SessionParticipant as ClientParticipant, ChatroomMessage as ClientMessage } from '@/lib/redux/slices/session/types';
import { Role } from '@/types';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 8; // 8 heures

// Type pour la réponse de Prisma incluant l'utilisateur
type PrismaSessionParticipantWithUser = Prisma.SessionParticipantGetPayload<{
  include: { user: true }
}>;


class SessionServiceController {
  constructor() {
    console.log("✅ [SessionService] Service de session en mode production initialisé avec Redis.");
  }

  private getKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  public async createSession(sessionData: ActiveSession): Promise<ActiveSession> {
    const key = this.getKey(sessionData.id);
    try {
      await redis.set(key, JSON.stringify(sessionData), 'EX', SESSION_EXPIRATION_SECONDS);
      console.log(`🚀 [SessionService] Session ${sessionData.id} créée et stockée dans Redis.`);
      return sessionData;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session dans Redis:', error);
      throw new Error('Échec de la création de la session.');
    }
  }

  public async getSession(sessionId: string): Promise<ActiveSession | null> {
    const key = this.getKey(sessionId);
    try {
      const data = await redis.get(key);
      if (!data) {
        console.warn(`[SessionService] Session non trouvée dans Redis pour l'ID: ${sessionId}`);
        return null;
      }
      return JSON.parse(data) as ActiveSession;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session depuis Redis:', error);
      return null;
    }
  }

  public async updateSession(sessionData: ActiveSession): Promise<ActiveSession> {
    const key = this.getKey(sessionData.id);
    try {
      // Assurer l'unicité des participants avant de sauvegarder
      const uniqueParticipants = Array.from(new Map(sessionData.participants.map(p => [p.id, p])).values());
      const sessionToSave = { ...sessionData, participants: uniqueParticipants };

      await redis.set(key, JSON.stringify(sessionToSave), 'EX', SESSION_EXPIRATION_SECONDS);
      return sessionToSave;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la session dans Redis:', error);
      throw error;
    }
  }

  public async endSession(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    try {
      await redis.del(key);
      console.log(`🏁 [SessionService] Session ${sessionId} terminée et supprimée de Redis.`);
    } catch (error) {
      console.error(`❌ Erreur lors de la fin de la session ${sessionId} dans Redis:`, error);
    }
  }
  
  public async findSessionIdForParticipant(userId: string): Promise<string | null> {
    try {
      const keys = await redis.keys('session:*');
      for (const key of keys) {
        const sessionData = await redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as ActiveSession;
          if (session.participants.some(p => p.id === userId)) {
            return session.id;
          }
        }
      }
      return null;
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de session pour le participant ${userId} dans Redis:`, error);
      return null;
    }
  }
  
  public async addMessage(sessionId: string, message: ClientMessage): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.messages.push(message);
      await this.updateSession(session);
    }
  }
  
  public async updateHandRaise(sessionId: string, userId: string, action: 'raise' | 'lower'): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
        const participant = session.participants.find(p => p.id === userId);
        if (action === 'raise' && !session.raisedHands.includes(userId)) {
            session.raisedHands.push(userId);
            if (participant) participant.hasRaisedHand = true;
        } else if (action === 'lower') {
            session.raisedHands = session.raisedHands.filter(id => id !== userId);
            if (participant) participant.hasRaisedHand = false;
        }
        await this.updateSession(session);
    }
  }

  public async recreateSessionFromDb(sessionId: string): Promise<ActiveSession | null> {
      console.log(`[SessionService] Tentative de recréation de la session ${sessionId} depuis la BDD.`);
      try {
        const dbSession = await prisma.chatroomSession.findUnique({
          where: { id: sessionId },
          include: {
            host: true,
            participants: { include: { user: true } },
            messages: { include: { author: true }, orderBy: { createdAt: 'asc' } },
          },
        });

        if (!dbSession || !dbSession.host) {
          console.warn(`[SessionService] Session ${sessionId} non trouvée dans la BDD ou sans hôte.`);
          return null;
        }

        const participants: ClientParticipant[] = dbSession.participants.map((p: PrismaSessionParticipantWithUser): ClientParticipant => ({
          id: p.userId,
          userId: p.userId,
          name: p.user.name || p.user.email,
          email: p.user.email,
          role: p.user.role as Role,
          img: p.user.img,
          isOnline: false, // La présence sera mise à jour par Socket.IO
          isInSession: true,
          points: 0,
          badges: [],
          isMuted: false, // Valeur par défaut
          breakoutRoomId: null,
        }));

        // Assurer que l'hôte est aussi dans la liste des participants pour l'UI
        if (!participants.some(p => p.id === dbSession.hostId)) {
          participants.unshift({
              id: dbSession.hostId,
              userId: dbSession.hostId,
              name: dbSession.host.name || dbSession.host.email,
              email: dbSession.host.email,
              role: dbSession.host.role as Role,
              img: dbSession.host.img,
              isOnline: true,
              isInSession: true,
              points: 0, badges: [], isMuted: false, breakoutRoomId: null,
          });
        }
        
        const messages: ClientMessage[] = dbSession.messages.map((msg: Prisma.ChatroomMessageGetPayload<{ include: { author: true } }>): ClientMessage => ({
            id: msg.id.toString(),
            content: msg.content,
            authorId: msg.authorId,
            chatroomSessionId: msg.chatroomSessionId,
            createdAt: msg.createdAt.toISOString(),
            author: msg.author,
        }));
        
        const activeSession: ActiveSession = {
          id: dbSession.id,
          hostId: dbSession.hostId,
          sessionType: dbSession.type as 'CLASS' | 'MEETING',
          classId: String(dbSession.classId),
          className: dbSession.title,
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
          messages,
          title: dbSession.title,
        };

        await this.createSession(activeSession);
        return activeSession;

      } catch (error) {
        console.error(`❌ Erreur lors de la recréation de la session ${sessionId} depuis la BDD:`, error);
        return null;
      }
  }
}

// Singleton pattern
declare global {
  var sessionService: SessionServiceController | undefined;
}

export const SessionService = global.sessionService || new SessionServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.sessionService = SessionService;
}
