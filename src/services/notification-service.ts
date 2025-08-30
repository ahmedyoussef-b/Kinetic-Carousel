// src/services/notification-service.ts
import prisma from '@/lib/prisma';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  recipientId: string;
}

interface Notification extends NotificationData {
  id: string;
  read: boolean;
  createdAt: Date;
}

class NotificationServiceController {
  constructor() {
    console.log("✅ [NotificationService] Service production initialisé avec PostgreSQL.");
  }

  /**
   * Adds a new notification for a specific user.
   */
  public async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          actionUrl: notificationData.actionUrl,
          recipientId: notificationData.recipientId,
          read: false,
        }
      });

      console.log(`📬 [NotificationService] Notification envoyée à ${notificationData.recipientId}. Titre: ${notificationData.title}`);
      
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
    }
  }

  /**
   * Retrieves all unread notifications for a specific user.
   */
  public async getUnreadNotifications(recipientId: string): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          recipientId,
          read: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`📤 [NotificationService] ${notifications.length} notifications non lues pour ${recipientId}.`);
      
      return notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        actionUrl: notif.actionUrl || undefined,
        recipientId: notif.recipientId,
        read: notif.read,
        createdAt: notif.createdAt
      }));
      
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Retrieves all notifications for a specific user (read and unread).
   */
  public async getAllNotifications(recipientId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      console.log(`📤 [NotificationService] ${notifications.length} notifications pour ${recipientId}.`);
      
      return notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        actionUrl: notif.actionUrl || undefined,
        recipientId: notif.recipientId,
        read: notif.read,
        createdAt: notif.createdAt
      }));
      
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Marks a notification as read.
   */
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });

      console.log(`✅ [NotificationService] Notification ${notificationId} marquée comme lue.`);
      
    } catch (error) {
      console.error('❌ Erreur marquage notification comme lue:', error);
    }
  }

  /**
   * Marks all notifications for a user as read.
   */
  public async markAllAsRead(recipientId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { 
          recipientId,
          read: false 
        },
        data: { read: true }
      });

      console.log(`✅ [NotificationService] Toutes les notifications marquées comme lues pour ${recipientId}.`);
      
    } catch (error) {
      console.error('❌ Erreur marquage notifications comme lues:', error);
    }
  }

  /**
   * Deletes a notification.
   */
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId }
      });

      console.log(`🗑️ [NotificationService] Notification ${notificationId} supprimée.`);
      
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
    }
  }

  /**
   * Gets notification count for a user.
   */
  public async getUnreadCount(recipientId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          recipientId,
          read: false
        }
      });

      return count;
      
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error);
      return 0;
    }
  }
}

// Singleton pattern
declare global {
  var notificationService: NotificationServiceController | undefined;
}

export const NotificationService = global.notificationService || new NotificationServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.notificationService = NotificationService;
}
