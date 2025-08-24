// src/services/notification-service.ts

// IMPORTANT: This is a simple in-memory implementation for demonstration purposes.
// In a production environment, this should be replaced with a persistent solution
// like a database table (e.g., Prisma Notification model) and potentially a real-time
// service like WebSockets (e.g., Socket.IO, Pusher, or Firebase Realtime Database).

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  timestamp: string;
}

// In-memory store for notifications, keyed by recipient user ID.
const notificationStore = new Map<string, Notification[]>();

class NotificationServiceController {
  constructor() {
    console.log("✅ [NotificationService] Service initialized.");
  }

  /**
   * Adds a new notification for a specific user.
   * @param recipientId The ID of the user who should receive the notification.
   * @param notification The notification object to add.
   */
  public sendNotification(recipientId: string, notification: Omit<Notification, 'id' | 'read' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    if (!notificationStore.has(recipientId)) {
      notificationStore.set(recipientId, []);
    }

    const userNotifications = notificationStore.get(recipientId)!;
    userNotifications.unshift(newNotification); // Add to the beginning of the list

    console.log(`📬 [NotificationService] Notification sent to ${recipientId}. Title: ${notification.title}`);
    console.log(`📊 [NotificationService] ${recipientId} now has ${userNotifications.length} notifications.`);
  }

  /**
   * Retrieves and clears all notifications for a specific user.
   * @param recipientId The ID of the user whose notifications are to be fetched.
   * @returns An array of notifications for the user.
   */
  public getNotifications(recipientId: string): Notification[] {
    if (!notificationStore.has(recipientId)) {
      return [];
    }

    const userNotifications = notificationStore.get(recipientId)!;
    // Clear the notifications after fetching them to prevent re-delivery.
    notificationStore.set(recipientId, []); 
    
    console.log(`📤 [NotificationService] Fetched and cleared ${userNotifications.length} notifications for ${recipientId}.`);
    return userNotifications;
  }
}

// Singleton pattern for development to prevent re-initialization on hot reloads
declare global {
  var notificationService: NotificationServiceController | undefined;
}

export const NotificationService = global.notificationService || new NotificationServiceController();

if (process.env.NODE_ENV !== 'production') {
  global.notificationService = NotificationService;
}
