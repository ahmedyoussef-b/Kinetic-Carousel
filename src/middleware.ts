// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { SESSION_COOKIE_NAME } from './lib/constants';

interface JwtPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

// Function to decode JWT without external libraries
function decodeJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}


export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Traitement de la requête pour : ${pathname}`);

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let userRole: Role | undefined;

  if (sessionToken) {
    const decodedToken = decodeJwt(sessionToken);
    if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
      userRole = decodedToken.role;
    }
  }
  console.log(`[Middleware] Rôle de session trouvé : ${userRole}`);
  
  const loginUrl = new URL('/login', req.url);
  const dashboardUrl = new URL('/dashboard', req.url);

  // --- Route Protection Logic ---

  // User is logged in
  if (userRole) {
    // If they are on a public/auth page (including the welcome page), redirect them to the central dashboard page
    if (['/login', '/register', '/accueil', '/'].includes(pathname)) {
        console.log(`[Middleware] L'utilisateur est connecté. Redirection de ${pathname} vers /dashboard.`);
        return NextResponse.redirect(dashboardUrl);
    }
      
    // Check if the user has access to the requested protected route
    const allowedRoles = Object.entries(routeAccessMap).find(([route]) => 
      new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    )?.[1];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(`[Middleware] Le rôle '${userRole}' n'est pas autorisé pour ${pathname}. Redirection vers /dashboard.`);
      return NextResponse.redirect(dashboardUrl);
    }
  } 
  // User is NOT logged in
  else {
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname));
    const isPublicRoute = ['/login', '/register', '/accueil'].includes(pathname);

    // If trying to access a protected route (that isn't public) without being logged in, redirect to login
    if (isProtectedRoute && !isPublicRoute) {
        console.log(`[Middleware] Accès non autorisé à ${pathname}, redirection vers la connexion.`);
        return NextResponse.redirect(loginUrl);
    }
  }

  console.log(`[Middleware] Autorisation de la requête vers ${pathname}.`);
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
