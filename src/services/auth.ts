import {
  createLeapifyAuthClient,
  signInWithGoogleRedirect,
  syncCookieSessionToStorage,
  getLeapifyToken,
  signOut as betterAuthSignOut,
  initializeSession,
} from 'leapify/client';
import type { UserProfile } from 'leapify/types';

const API_URL = import.meta.env.VITE_LEAPIFY_API_URL || window.location.origin;

export const authClient = createLeapifyAuthClient(API_URL);

export async function signIn(callbackURL = '/'): Promise<void> {
  await signInWithGoogleRedirect(authClient, callbackURL);
}

export async function signOut(): Promise<void> {
  await betterAuthSignOut(authClient);
}

export async function restoreSession(): Promise<UserProfile | null> {
  await syncCookieSessionToStorage(authClient);
  return initializeSession(API_URL, () => getLeapifyToken());
}

export async function getToken(): Promise<string | null> {
  return getLeapifyToken();
}

export type { UserProfile };
