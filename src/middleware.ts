// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { SESSION_COOKIE_NAME } from './lib/constants';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie;
  const loginUrl = new URL('/login', req.url);

  // --- Protected Route Logic ---
  // If user is not authenticated
  if (!isAuthenticated) {
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => 
        new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    );
    const isPublicAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p));
    
    // Allow access to the root page (new public homepage)
    if (pathname === '/') {
       return NextResponse.next();
    }

    // If trying to access a protected route, redirect to login
    if (isProtectedRoute && !isPublicAuthRoute) {
        console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to login.`);
        return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and tries to access auth pages, redirect them away
  // This will be handled by the logic on the root page ('/')
  if (isAuthenticated && ['/login', '/register', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
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
