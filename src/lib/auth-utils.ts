// src/lib/auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from './firebase-admin';
import type { SafeUser } from '@/types';

/**
 * Retrieves the server-side session by verifying the Firebase session cookie.
 * This is the primary method for protecting server-side routes and API endpoints.
 * @returns A promise that resolves to the session payload (containing the user) or null if invalid.
 */
export async function getServerSession(): Promise<{ user: SafeUser } | null> {
  console.log('--- 🍪 [Serveur V2] Tentative de récupération de la session ---');
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    console.log('🚫 [Serveur V2] Pas de jeton de session trouvé dans les cookies.');
    return null;
  }
  
  console.log('✅ [Serveur V2] Jeton trouvé, tentative de vérification avec Firebase Admin...');
  try {
    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();
    
    // Verify the session cookie with Firebase Admin
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
    
    console.log('🔍 [Serveur V2] Jeton Firebase décodé:', decodedToken);

    // The decoded token from Firebase contains all the necessary user info.
    // We can construct the SafeUser object directly from it.
    const user: SafeUser = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || null,
      img: decodedToken.picture || null,
      role: (decodedToken.role as any) || 'VISITOR', // Default role if not set
      // Add other fields from your SafeUser type as needed, extracting from decodedToken
      active: true, // Assume active if token is valid
      firstName: '', // These can be fetched from your DB if needed
      lastName: '',
      twoFactorEnabled: decodedToken.two_factor_enabled || false
    };

    return { user };
  } catch (error) {
    console.error('❌ [Serveur V2] Jeton de session Firebase invalide ou expiré:', error);
    // Clear the invalid cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}
