// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { getServerSession } from './lib/auth-utils';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);

  const session = await getServerSession();
  const userRole = session?.user?.role;

  console.log(`[Middleware] Session role found: ${userRole}`);
  
  const loginUrl = new URL('/login', req.url);

  // --- Route Protection Logic ---

  // User is logged in
  if (userRole) {
    const dashboardUrl = new URL(`/${userRole.toLowerCase()}`, req.url);
    // If they are on a public/auth page, redirect them to their dashboard
    if (['/login', '/register', '/accueil'].includes(pathname)) {
        console.log(`[Middleware] User is logged in. Redirecting from ${pathname} to their dashboard.`);
        return NextResponse.redirect(dashboardUrl);
    }
      
    // Check if the user has access to the requested protected route
    const allowedRoles = Object.entries(routeAccessMap).find(([route]) => 
      new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    )?.[1];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(`[Middleware] Role '${userRole}' not allowed for ${pathname}. Redirecting to their dashboard.`);
      return NextResponse.redirect(dashboardUrl);
    }
  } 
  // User is NOT logged in
  else {
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname));
    const isPublicRoute = ['/login', '/register', '/accueil', '/'].includes(pathname);

    // If trying to access a protected route without being logged in, redirect to login
    if (isProtectedRoute && !isPublicRoute) {
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
