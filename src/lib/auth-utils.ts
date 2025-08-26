// src/lib/auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';
import admin from 'firebase-admin';
import type { SafeUser } from '@/types';
import prisma from './prisma';

// Helper function to initialize Firebase Admin SDK, ensuring it's a singleton.
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("🔥 [Auth Utils] Initializing Firebase Admin SDK...");
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG;
    if (!serviceAccount) {
      throw new Error('Firebase Admin SDK config is not set in environment variables.');
    }
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  }
  return admin;
}


/**
 * Retrieves the server-side session by verifying the Firebase session cookie.
 * This is the primary method for protecting server-side routes and API endpoints.
 * @returns A promise that resolves to the session payload (containing the user) or null if invalid.
 */
export async function getServerSession(): Promise<{ user: SafeUser } | null> {
  console.log('--- 🍪 [Serveur] Tentative de récupération de la session ---');
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    console.log('🚫 [Serveur] Pas de jeton de session trouvé dans les cookies.');
    return null;
  }
  
  console.log('✅ [Serveur] Jeton trouvé, tentative de vérification...');
  try {
    const adminInstance = initializeFirebaseAdmin();
    
    const decodedToken = await adminInstance.auth().verifySessionCookie(sessionCookie, true);
    console.log('🔍 [Serveur] Jeton décodé:', decodedToken);

    // After verifying the token, we still fetch the user from our DB
    // to ensure the role and other details are up-to-date with our system.
    const userFromDb = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!userFromDb) {
      console.error(`🚫 [Serveur] Utilisateur avec UID ${decodedToken.uid} non trouvé dans la DB.`);
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }
    
    console.log(`✅ [Serveur] Utilisateur trouvé dans la DB: ${userFromDb.email}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = userFromDb;

    return { user: safeUser };
  } catch (error) {
    console.error('❌ [Serveur] Jeton de session invalide ou expiré:', error);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}
