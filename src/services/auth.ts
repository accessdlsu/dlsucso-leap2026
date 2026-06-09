import {
  createLeapifyAuthClient,
  signInWithGoogleRedirect,
  getLeapifyToken,
  signOut as betterAuthSignOut,
} from 'leapify/client';
import type { UserProfile } from 'leapify/types';
import { leapifyApi } from './leapify';

const API_URL = window.location.origin;

export const authClient = createLeapifyAuthClient(API_URL);

export async function signIn(callbackPath = '/'): Promise<void> {
  const callbackURL = window.location.origin + callbackPath;
  console.log('[auth] signIn → redirecting to Google, callbackURL:', callbackURL);
  await signInWithGoogleRedirect(authClient, callbackURL);
}

export async function signOut(): Promise<void> {
  console.log('[auth] signOut');
  await betterAuthSignOut(authClient);
}

export async function restoreSession(): Promise<UserProfile | null> {
  console.log('[auth] restoreSession: reading cookie session');
  // Read cookie session directly — don't use authClient because it sends
  // an empty Bearer token which causes Better Auth to ignore the cookie.
  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      credentials: 'include',
    });
    console.log('[auth] get-session response:', res.status);
    if (!res.ok) return null;
    const body = await res.json();
    console.log('[auth] get-session body:', JSON.stringify(body).slice(0, 500));
    const token = body?.session?.token ?? body?.data?.session?.token;
    if (token) {
      localStorage.setItem('better-auth.session_token', token);
      console.log('[auth] session token stored in localStorage');
    } else {
      console.log('[auth] no token in get-session response, body keys:', Object.keys(body));
    }
  } catch (err) {
    console.log('[auth] get-session failed (guest):', err);
  }

  const token = await getLeapifyToken();
  if (!token) {
    console.log('[auth] no token found, returning null');
    return null;
  }
  leapifyApi.setToken(token);

  // Fetch user profile via HTTP proxy — avoids WebSocket/Turnstile dependency
  // which isn't ready during initial page load.
  try {
    console.log('[auth] fetching /api/users/me');
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[auth] /api/users/me response:', res.status);
    if (!res.ok) return null;
    const body = await res.json();
    const profile = (body as { data: UserProfile | null }).data ?? null;
    console.log('[auth] user profile:', profile ? `${profile.name} (${profile.role})` : 'null');
    return profile;
  } catch (err) {
    console.error('[auth] /api/users/me failed:', err);
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  return getLeapifyToken();
}

export type { UserProfile };
