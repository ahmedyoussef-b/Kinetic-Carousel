// src/lib/firebase-admin.ts
// This file is no longer used for initialization to prevent client-side bundling issues.
// The initialization logic has been moved directly into server-side scripts that need it, like `prisma/seed.js`.
import admin from 'firebase-admin';

export function getInitializedFirebaseAdmin() {
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
      throw new Error("Could not initialize Firebase Admin SDK: " + error.message);
    }
  }
  return admin;
}
