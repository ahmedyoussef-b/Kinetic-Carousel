// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { getServerSession } from './lib/auth-utils';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);
  
  // 1. Toujours rediriger la racine vers /accueil
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/accueil', req.url));
  }

  const session = await getServerSession();
  const userRole = session?.user?.role;

  console.log(`[Middleware] Session role found: ${userRole}`);
  
  const loginUrl = new URL('/login', req.url);

  // --- Logique de protection des routes ---

  // L'utilisateur est connecté
  if (userRole) {
    const dashboardUrl = new URL(`/${userRole.toLowerCase()}`, req.url);
    
    // S'il est sur une page publique/d'authentification, le rediriger vers son tableau de bord
    if (['/login', '/register', '/accueil'].includes(pathname)) {
        console.log(`[Middleware] User is logged in. Redirecting from ${pathname} to their dashboard.`);
        return NextResponse.redirect(dashboardUrl);
    }
      
    // Vérifier si l'utilisateur a accès à la route protégée demandée
    const allowedRoles = Object.entries(routeAccessMap).find(([route]) => 
      new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    )?.[1];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(`[Middleware] Role '${userRole}' not allowed for ${pathname}. Redirecting to their dashboard.`);
      return NextResponse.redirect(dashboardUrl);
    }
  } 
  // L'utilisateur N'EST PAS connecté
  else {
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => 
        new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    );
    const isPublicAuthRoute = ['/login', '/register', '/accueil', '/forgot-password', '/reset-password'].includes(pathname);

    // S'il essaie d'accéder à une route protégée sans être connecté, le rediriger vers la page de connexion
    if (isProtectedRoute && !isPublicAuthRoute) {
        console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to login.`);
        return NextResponse.redirect(loginUrl);
    }
  }

  console.log(`[Middleware] Allowing request to ${pathname}.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any other static assets in /public
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
