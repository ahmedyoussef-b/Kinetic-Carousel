'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';
import { initializeFirebaseAdmin } from './firebase-admin';
import type { SafeUser } from '@/types';
import prisma from './prisma';
import { Role } from '@/types';

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
    const admin = await initializeFirebaseAdmin();
    
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    console.log('🔍 [Serveur] Jeton décodé:', decodedToken);

    // --- CONTOURNEMENT PRISMA ---
    // Au lieu de chercher dans la base de données, nous créons un utilisateur fictif
    // basé sur les informations du cookie de session.
    console.warn("⚠️ [Serveur/Session] Contournement de Prisma. Création d'un utilisateur de session fictif.");
    const safeUser: SafeUser = {
        id: decodedToken.uid,
        email: decodedToken.email || 'no-email@example.com',
        name: decodedToken.name || 'Utilisateur',
        firstName: decodedToken.name?.split(' ')[0] || 'Utilisateur',
        lastName: decodedToken.name?.split(' ')[1] || '',
        username: decodedToken.email || `user_${decodedToken.uid}`,
        role: (decodedToken.role as Role) || Role.ADMIN, // Assigner le rôle ADMIN par défaut pour le test
        active: true,
        img: decodedToken.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
    };
     console.log(`✅ [Serveur/Session] Utilisateur fictif créé pour la session: ${safeUser.email}`);

    return { user: safeUser };
  } catch (error) {
    console.error('❌ [Serveur] Jeton de session invalide ou expiré:', error);
    // Supprime le cookie invalide pour éviter des vérifications inutiles
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}
