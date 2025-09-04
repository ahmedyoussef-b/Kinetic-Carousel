// src/services/session-service.ts
import type { ActiveSession, SessionParticipant as ClientParticipant, ChatroomMessage as ClientMessage, SessionType } from '@/lib/redux/slices/session/types';
import prisma from '@/lib/prisma';
import { Role } from '@/types';

class SessionServiceController {
  constructor() {
    console.log("✅ [SessionService] Service de session en mode production initialisé.");
  }

  public async createSession(sessionData: Partial<ActiveSession>): Promise<ActiveSession> {
    const { id, title, sessionType, classId, hostId, participants = [] } = sessionData;

    if (!id || !title || !sessionType || !hostId) {
      throw new Error("Les informations essentielles de la session (ID, titre, type, hôte) sont requises.");
    }

    try {
      // FIX: Filter out the host from the participants list to prevent DB constraint errors.
      const participantData = participants
        .filter(p => p.userId !== hostId)
        .map(p => ({ userId: p.userId! }));

      const dbSession = await prisma.chatroomSession.create({
        data: {
          id,
          title,
          type: sessionType,
          classId: classId ? parseInt(classId, 10) : null,
          hostId,
          status: 'ACTIVE',
          startTime: new Date(),
          participants: {
            create: participantData,
          },
        },
        include: { host: true, participants: { include: { user: true } }, raisedHands: true, messages: { include: { author: true } } },
      });
      console.log(`🚀 [SessionService] Session ${id} créée avec succès en base de données.`);
      return this.mapDbSessionToActiveSession(dbSession);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session en base de données:', error);
      throw new Error('Échec de la création de la session en base de données.');
    }
  }

  public async getSession(sessionId: string): Promise<ActiveSession | null> {
    const dbSession = await prisma.chatroomSession.findUnique({
      where: { id: sessionId, status: 'ACTIVE' },
      include: {
        host: true,
        participants: { include: { user: true } },
        messages: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        raisedHands: true,
      }
    });

    if (!dbSession) {
      console.warn(`[SessionService] Session active non trouvée pour l'ID: ${sessionId}`);
      return null;
    }
    
    return this.mapDbSessionToActiveSession(dbSession);
  }

  public async endSession(sessionId: string): Promise<void> {
    try {
      await prisma.chatroomSession.update({
        where: { id: sessionId },
        data: { status: 'ENDED', endTime: new Date() },
      });
      console.log(`🏁 [SessionService] Session ${sessionId} terminée.`);
    } catch (error) {
      console.error(`❌ Erreur lors de la fin de la session ${sessionId}:`, error);
    }
  }
  
  public async findSessionIdForParticipant(userId: string): Promise<string | null> {
    const participantEntry = await prisma.sessionParticipant.findFirst({
      where: {
        userId: userId,
        session: {
          status: 'ACTIVE'
        }
      },
      select: { chatroomSessionId: true }
    });
    return participantEntry?.chatroomSessionId || null;
  }
  
  public async addMessage(sessionId: string, message: { content: string; authorId: string; }): Promise<void> {
    try {
        await prisma.chatroomMessage.create({
            data: {
                content: message.content,
                authorId: message.authorId,
                chatroomSessionId: sessionId,
            }
        });
    } catch (error) {
        console.error(`❌ Erreur lors de l'ajout du message à la session ${sessionId}:`, error);
    }
  }
  
  public async updateHandRaise(sessionId: string, userId: string, action: 'raise' | 'lower'): Promise<void> {
    try {
      if (action === 'raise') {
        await prisma.raisedHand.upsert({
          where: { chatroomSessionId_userId: { chatroomSessionId: sessionId, userId } },
          create: { chatroomSessionId: sessionId, userId },
          update: { raisedAt: new Date() },
        });
      } else {
        await prisma.raisedHand.deleteMany({ where: { chatroomSessionId: sessionId, userId } });
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de la main levée pour l'utilisateur ${userId} dans la session ${sessionId}:`, error);
    }
  }

  public async recreateSessionFromDb(sessionId: string): Promise<ActiveSession | null> {
    console.log(`🔄 [SessionService] Tentative de recréation de la session ${sessionId} depuis la base de données.`);
    return this.getSession(sessionId);
  }

  private mapDbSessionToActiveSession(dbSession: any): ActiveSession {
    const raisedHandsUserIds = dbSession.raisedHands?.map((rh: any) => rh.userId) || [];

    const participants: ClientParticipant[] = dbSession.participants?.map((p: any) => ({
        id: p.userId,
        userId: p.userId,
        name: p.user.name || p.user.email,
        email: p.user.email,
        img: p.user.img,
        role: p.user.role as Role,
        isOnline: true, 
        isInSession: true,
        points: 0,
        badges: [],
        isMuted: p.isMuted,
        hasRaisedHand: raisedHandsUserIds.includes(p.userId),
        raisedHandAt: dbSession.raisedHands?.find((rh: any) => rh.userId === p.userId)?.raisedAt.toISOString(),
    })) || [];

    const messages: ClientMessage[] = dbSession.messages?.map((msg: any) => ({
      id: msg.id.toString(),
      content: msg.content,
      authorId: msg.authorId,
      chatroomSessionId: msg.chatroomSessionId,
      createdAt: msg.createdAt.toISOString(),
      author: {
        id: msg.author.id,
        name: msg.author.name,
        email: msg.author.email,
        img: msg.author.img,
        role: msg.author.role,
      }
    })) || [];
    
    return {
      id: dbSession.id,
      hostId: dbSession.hostId,
      sessionType: dbSession.type,
      classId: dbSession.classId ? String(dbSession.classId) : '',
      className: dbSession.title,
      title: dbSession.title,
      participants: participants,
      startTime: dbSession.startTime.toISOString(),
      raisedHands: raisedHandsUserIds,
      messages: messages,
      reactions: [],
      polls: [],
      quizzes: [],
      rewardActions: [],
      classTimer: null,
      spotlightedParticipantId: null,
      breakoutRooms: null,
      breakoutTimer: null,
    };
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
