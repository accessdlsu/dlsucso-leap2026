/**
 * Browser-side auth service wrapping leapify/client.
 *
 * Flow:
 *   1. syncCookieSessionToStorage() — after OAuth redirect, copies HTTP-only
 *      cookie session into localStorage as 'better-auth.session_token'.
 *   2. fetchProfile() — reads token from localStorage, fetches /api/users/me
 *      via HTTP (no WebSocket needed), caches result in localStorage.
 *   3. Navbar reads cached profile on mount, optionally refetches.
 */

import {
  createLeapifyAuthClient,
  syncCookieSessionToStorage,
  getLeapifyToken,
  signOut as betterAuthSignOut,
} from "leapify/client";
import type { UserProfile } from "leapify/types";
import { leapifyApi } from "./leapify";

const CACHE_KEY = "leapify_user_profile";

let authClient: ReturnType<typeof createLeapifyAuthClient> | null = null;

function getClient() {
  if (!authClient) {
    authClient = createLeapifyAuthClient(window.location.origin);
  }
  return authClient;
}

let _restorePromise: Promise<UserProfile | null> | null = null;

/**
 * Sync the HTTP-only cookie session (set after OAuth redirect) into
 * localStorage so the bearer token is available for API calls.
 * Concurrent calls share one in-flight request — no duplicate network hits.
 */
export function restoreSession(): Promise<UserProfile | null> {
  if (_restorePromise) return _restorePromise;
  _restorePromise = (async () => {
    try {
      const client = getClient();
      await syncCookieSessionToStorage(client);
      return await fetchProfile();
    } catch {
      return null;
    } finally {
      _restorePromise = null;
    }
  })();
  return _restorePromise;
}

/**
 * Read the cached user profile from localStorage (fast, no network).
 */
export function getCachedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the user profile from /api/users/me (HTTP — no WebSocket needed).
 * Caches the result in localStorage. Returns null for guests.
 */
export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const token = await getLeapifyToken(getClient());
    if (!token) return null;

    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const body = await res.json();
    const user: UserProfile = body?.data ?? body;
    if (!user?.id) return null;
    localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

/**
 * Sign out — invalidates the session server-side and clears local cache.
 */
export async function signOutUser(): Promise<void> {
  // Invalidate server-side session (clears HTTP-only cookie)
  try {
    await betterAuthSignOut(getClient());
  } catch {}
  // Belt-and-suspenders: also hit the endpoint directly so the cookie is cleared
  try {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
  } catch {}
  // Clear API token so any in-flight WS requests stop using the old session
  leapifyApi.setToken(null);
  // Wipe all auth-related localStorage keys
  localStorage.removeItem(CACHE_KEY);
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("better-auth")) localStorage.removeItem(key);
  }
  // Hard navigate so the page re-initialises completely (no Astro client-router)
  window.location.replace("/login");
}
