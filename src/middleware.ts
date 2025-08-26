// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from './lib/constants';

// 1. Spécifiez ici les chemins publics
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Traitement de la requête pour : ${pathname}`);

  // 2. Si le chemin est public, ne rien faire
  if (publicPaths.some(path => pathname.startsWith(path)) && pathname.length === 1 || publicPaths.includes(pathname)) {
    console.log(`[Middleware] Route publique détectée pour ${pathname}, passage au suivant.`);
    return NextResponse.next();
  }

  // 3. Pour toutes les autres routes, vérifier l'authentification
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie;

  if (!isAuthenticated) {
    console.log(`[Middleware] Accès non autorisé à la route protégée ${pathname}, redirection vers la connexion.`);
    const loginUrl = new URL('/login', req.url);
    // Optionnel : ajouter l'URL de redirection pour une meilleure expérience utilisateur après la connexion
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Si l'utilisateur est authentifié, autoriser l'accès
  console.log(`[Middleware] Accès autorisé à la route protégée ${pathname}.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Faire correspondre tous les chemins de requête sauf ceux qui commencent par :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'image)
     * - favicon.ico (fichier favicon)
     * - tout autre actif statique dans /public
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
