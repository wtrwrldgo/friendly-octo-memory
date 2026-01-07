// file: lib/auth-helpers.ts
// Helper functions for server-side authentication in API routes

import { cookies } from 'next/headers';

/**
 * Extract auth token from cookies in an API route
 * Use this in server-side API routes to get the token stored by the client
 */
export function getAuthTokenFromCookies(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('auth-token')?.value;
}
