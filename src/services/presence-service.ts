// src/services/presence-service.ts
import prisma from '@/lib/prisma';
import { PresenceStatus } from '@prisma/client';

class PresenceServiceController {
  constructor() {
    console.log("✅ [PresenceService] Service de production initialisé avec PostgreSQL.");
    // Nettoyage périodique des connexions expirées
    setInterval(() => this.cleanup(), 1000 * 60 * 15); // Toutes les 15 minutes
  }

  public async updateUserStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    try {
      console.log(`🔄 [PresenceService] Mise à jour du statut pour l'utilisateur ${userId} à ${status}`);
      
      const presenceStatus = status === 'online' ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE;

      await prisma.userPresence.upsert({
        where: { userId },
        update: { 
          status: presenceStatus,
          lastSeen: new Date()
        },
        create: {
          userId,
          status: presenceStatus,
          lastSeen: new Date()
        }
      });

      const onlineCount = await this.getOnlineUserIds();
      console.log(`📊 [PresenceService] Utilisateurs en ligne actuels: ${onlineCount.length}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut utilisateur:', error);
    }
  }

  public async getOnlineUserIds(): Promise<string[]> {
    try {
      console.log("🔍 [PresenceService] Récupération des IDs d'utilisateurs en ligne depuis la base de données.");
      
      const timeout = new Date(Date.now() - 1000 * 60); // Timeout de 1 minute
      
      const onlineUsers = await prisma.userPresence.findMany({
        where: {
          status: PresenceStatus.ONLINE,
          lastSeen: {
            gt: timeout // Seulement les utilisateurs vus dans la dernière minute
          }
        },
        select: { userId: true }
      });

      const userIds = onlineUsers.map(user => user.userId);
      console.log(`👍 [PresenceService] ${userIds.length} utilisateurs actifs trouvés.`);
      
      return userIds;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs en ligne:', error);
      return [];
    }
  }

  public async getUserStatus(userId: string): Promise<'online' | 'offline'> {
    try {
      const timeout = new Date(Date.now() - 1000 * 60); // Timeout de 1 minute
      
      const presence = await prisma.userPresence.findUnique({
        where: { userId },
        select: { status: true, lastSeen: true }
      });

      if (!presence || presence.status === PresenceStatus.OFFLINE) {
        return 'offline';
      }

      // Vérifier si l'utilisateur est toujours actif
      if (presence.lastSeen < timeout) {
        return 'offline';
      }

      return 'online';
    } catch (error) {
      console.error('❌ Erreur récupération statut utilisateur:', error);
      return 'offline';
    }
  }

  private async cleanup(): Promise<void> {
    try {
      console.log("🧹 [PresenceService] Lancement du nettoyage des connexions obsolètes.");
      
      const timeout = new Date(Date.now() - 1000 * 60 * 10); // Timeout de 10 minutes
      
      const result = await prisma.userPresence.updateMany({
        where: {
          status: PresenceStatus.ONLINE,
          lastSeen: {
            lt: timeout
          }
        },
        data: {
          status: PresenceStatus.OFFLINE
        }
      });

      if (result.count > 0) {
        console.log(`🧹 [PresenceService] ${result.count} connexions obsolètes nettoyées.`);
      }
      
    } catch (error) {
      console.error('❌ Erreur nettoyage présence:', error);
    }
  }
}

// Singleton pattern
declare global {
  var presenceService: PresenceServiceController | undefined;
}

export const PresenceService = global.presenceService || new PresenceServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.presenceService = PresenceService;
}
