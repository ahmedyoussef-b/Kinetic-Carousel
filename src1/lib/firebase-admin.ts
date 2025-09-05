// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

/**
 * A singleton pattern to initialize Firebase Admin SDK.
 * Ensures that the SDK is initialized only once.
 */
export async function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("🔥 [Firebase Admin] Initializing Admin SDK...");
    
    const adminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
        console.error("🔥 [Firebase Admin] ❌ Missing Firebase Admin SDK configuration. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.");
        throw new Error('Firebase Admin SDK configuration is incomplete.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
      });
      console.log("🔥 [Firebase Admin] ✅ Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("🔥 [Firebase Admin] ❌ Error initializing Admin SDK:", error.message);
      throw new Error("Could not initialize Firebase Admin SDK: " + error.message);
    }
  }
  return admin;
}

// Export adminAuth directly for convenience, ensuring initialization has been called elsewhere.
export const adminAuth = admin.apps.length ? admin.auth() : undefined;
