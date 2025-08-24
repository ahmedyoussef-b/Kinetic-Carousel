// src/lib/auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { JwtPayload, SafeUser } from '@/types';
import prisma from './prisma';
import { SESSION_COOKIE_NAME } from './constants';

export async function getServerSession() {
  console.log('--- 🍪 [Serveur] Tentative de récupération de la session ---');
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    console.log('🚫 [Serveur] Pas de jeton de session trouvé dans les cookies.');
    return null;
  }
  console.log('✅ [Serveur] Jeton trouvé, tentative de vérification...');

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    const decoded = payload as JwtPayload;
    console.log('🔍 [Serveur] Jeton décodé:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        img: true,
        active: true,
        firstName: true,
        lastName: true,
        twoFactorEnabled: true,
      }
    });

    if (!user) {
      console.log(`🛑 [Serveur] Utilisateur non trouvé pour l'ID: ${decoded.userId}`);
      return null;
    }

    console.log(`✅ [Serveur] Utilisateur trouvé dans la DB: ${user.email}`);
    return { user: user as SafeUser };
  } catch (error) {
    console.error('❌ [Serveur] Jeton invalide ou expiré:', error);
    return null;
  }
}
