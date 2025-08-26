// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { SESSION_COOKIE_NAME } from './lib/constants';

// This function is no longer needed in the middleware.
// We will rely on checking the cookie's existence.
// import { getServerSession } from './lib/auth-utils'; 

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);
  
  // 1. Toujours rediriger la racine vers /accueil
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/accueil', req.url));
  }

  // Check for the session cookie directly, without verifying it here.
  // The actual verification happens on the server when data is requested.
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie;

  console.log(`[Middleware] User authenticated status (cookie exists): ${isAuthenticated}`);
  
  const loginUrl = new URL('/login', req.url);

  // --- Logique de protection des routes ---

  // For now, we cannot know the user's role in the middleware without `firebase-admin`.
  // The redirection from public pages will now happen client-side in the page component itself.
  if (isAuthenticated) {
    if (['/login', '/register', '/accueil', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p))) {
        // Since we don't know the role, we redirect to a generic dashboard path,
        // which will then be handled by the page's logic or a subsequent server-side redirect.
        console.log(`[Middleware] User is logged in. Redirecting from ${pathname} to root to let the app decide the dashboard.`);
        return NextResponse.redirect(new URL('/', req.url));
    }
  } 
  // L'utilisateur N'EST PAS connecté
  else {
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => 
        new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    );
    const isPublicAuthRoute = ['/login', '/register', '/accueil', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p));

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
