// file: lib/auth-helpers.ts
// Helper functions for server-side authentication in API routes

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Extract auth token from cookies in an API route
 * Use this in server-side API routes to get the token stored by the client
 */
export function getAuthTokenFromCookies(request?: NextRequest): string | undefined {
  const cookieStore = cookies();
  const cookieToken =
    cookieStore.get('auth-token')?.value ||
    cookieStore.get('authToken')?.value;

  if (cookieToken) return cookieToken;

  const authHeader = request?.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return undefined;
}
