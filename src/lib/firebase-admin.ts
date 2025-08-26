// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It ensures that the SDK is only initialized once (singleton pattern).
export function initializeFirebaseAdmin() {
  // Check if the app is already initialized to prevent errors
  if (!admin.apps.length) {
    console.log("🔥 [Firebase Admin] Initializing Admin SDK...");
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG;

    if (!serviceAccount) {
      throw new Error('Firebase Admin SDK config is not set in environment variables.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log("🔥 [Firebase Admin] ✅ Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("🔥 [Firebase Admin] ❌ Error initializing Admin SDK:", error.message);
      // You might want to throw the error to halt execution if admin access is critical
      throw new Error("Could not initialize Firebase Admin SDK: " + error.message);
    }
  }
  return admin;
}
