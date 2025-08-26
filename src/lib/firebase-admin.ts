'use server';
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

/**
 * A singleton pattern to initialize Firebase Admin SDK.
 * Ensures that the SDK is initialized only once.
 * This file is marked with "use server" to prevent it from being bundled into client-side code.
 */
export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("🔥 [Firebase Admin] Initializing Admin SDK...");
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG;

    if (!serviceAccount) {
      console.error("🔥 [Firebase Admin] ❌ FIREBASE_ADMIN_SDK_CONFIG is not set.");
      throw new Error('Firebase Admin SDK config is not set in environment variables.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log("🔥 [Firebase Admin] ✅ Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("🔥 [Firebase Admin] ❌ Error initializing Admin SDK:", error.message);
      throw new Error("Could not initialize Firebase Admin SDK: " + error.message);
    }
  }
  return admin;
}
