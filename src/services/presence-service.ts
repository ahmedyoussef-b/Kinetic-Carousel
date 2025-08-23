// src/services/presence-service.ts

interface UserStatus {
  status: 'online' | 'offline';
  lastSeen: number;
}

// In-memory store for presence status.
// Using a class with static methods to ensure a singleton-like behavior in Node.js module caching.
class PresenceServiceController {
  private presenceStore: Map<string, UserStatus>;

  constructor() {
    this.presenceStore = new Map<string, UserStatus>();
    console.log("✅ [PresenceService] Service initialized.");
    // Optional: Add a cleanup interval to remove very old entries
    setInterval(() => this.cleanup(), 1000 * 60 * 15); // Clean up every 15 minutes
  }

  public updateUserStatus(userId: string, status: 'online' | 'offline'): void {
    console.log(`🔄 [PresenceService] Updating status for user ${userId} to ${status}`);
    if (status === 'online') {
      this.presenceStore.set(userId, { status, lastSeen: Date.now() });
    } else {
      this.presenceStore.delete(userId);
    }
     console.log(`📊 [PresenceService] Current online users: ${this.getOnlineUserIds().length}`, this.getOnlineUserIds());
  }

  public getOnlineUserIds(): string[] {
    console.log("🔍 [PresenceService] Getting online user IDs.");
    // Also filter out users who haven't been seen in a while (e.g., 1 minute)
    const now = Date.now();
    const timeout = 1000 * 60; // 1 minute
    
    const onlineUsers = Array.from(this.presenceStore.entries())
      .filter(([, data]) => data.status === 'online' && (now - data.lastSeen < timeout))
      .map(([userId]) => userId);
      
    console.log(`👍 [PresenceService] Found ${onlineUsers.length} active users.`);
    return onlineUsers;
  }

  private cleanup(): void {
    console.log("🧹 [PresenceService] Running cleanup for stale connections.");
    const now = Date.now();
    const timeout = 1000 * 60 * 10; // 10 minutes timeout
    for (const [userId, data] of this.presenceStore.entries()) {
      if (now - data.lastSeen > timeout) {
        console.log(`- [PresenceService] Removing stale user: ${userId}`);
        this.presenceStore.delete(userId);
      }
    }
  }
}

// Export a single instance of the controller
export const PresenceService = new PresenceServiceController();
