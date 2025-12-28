// Client-side API helper to get token from NextAuth session
'use client';

import { getSession } from 'next-auth/react';

/**
 * Get auth token from NextAuth session (client-side)
 */
export async function getClientAuthToken(): Promise<string | null> {
  const session = await getSession();
  if (session && (session as any).token) {
    return (session as any).token;
  }
  
  // Fallback to localStorage (for signup flow)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  
  return null;
}

