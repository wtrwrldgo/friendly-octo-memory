import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/robots.txt', '/sitemap.xml', '/manifest.json'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow all API routes - they handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow proxy-image routes (for serving VPS images)
  if (pathname.startsWith('/proxy-image/')) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webmanifest|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check auth token
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('authToken')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token is valid (basic check - decode JWT payload)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|proxy-image).*)'],
};
