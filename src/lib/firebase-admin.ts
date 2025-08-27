'use server';
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

/**
 * A singleton pattern to initialize Firebase Admin SDK.
 * Ensures that the SDK is initialized only once.
 * This file is marked with "use server" to prevent it from being bundled into client-side code.
 */
export async function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("🔥 [Firebase Admin] Initializing Admin SDK...");
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG;

    if (!serviceAccount) {
      console.error("🔥 [Firebase Admin] ❌ FIREBASE_ADMIN_SDK_CONFIG n'est pas définie dans les variables d'environnement.");
      throw new Error('La configuration du SDK Admin Firebase n\'est pas définie dans les variables d\'environnement.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log("🔥 [Firebase Admin] ✅ Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("🔥 [Firebase Admin] ❌ Erreur lors de l'initialisation du SDK Admin:", error.message);
      throw new Error("Impossible d'initialiser le SDK Admin Firebase : " + error.message);
    }
  }
  return admin;
}
