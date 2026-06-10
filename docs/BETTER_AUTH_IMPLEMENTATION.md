# Better Auth Implementation

## Overview

The project uses **Better Auth** for authentication, replacing the previous Firebase Auth system. Better Auth is a session-based auth library that runs on the backend (Cloudflare Worker) and uses HTTP-only cookies for session management. The frontend consumes it through the `leapify/client` package, which provides a browser-safe Better Auth client.

## Architecture

```
Browser                          Cloudflare Worker (edge)           Backend (leapify-console)
┌─────────────┐                  ┌─────────────────────┐           ┌──────────────────┐
│  auth.ts     │──/api/auth/*──▶ │  HTTP proxy          │──fetch──▶ │  Better Auth     │
│  useAuth.ts  │                 │  (worker/index.ts)   │◀─resp──── │  (Hono routes)   │
│  leapify.ts  │──WebSocket────▶ │  WS proxy            │──fetch──▶ │                  │
└─────────────┘                  └─────────────────────┘           └──────────────────┘
```

## Key Concept: Two Auth Paths

The frontend uses **two different paths** to interact with Better Auth, depending on context:

1. **HTTP proxy** (`/api/auth/*`, `/api/users/me`) — used for OAuth flows, session restoration, and user profile fetches during initial page load (before WebSocket/Turnstile is ready)
2. **WebSocket proxy** (`wsClient.request()`) — used for all authenticated API calls after the WebSocket connection is established (bookmarks, sign-out, etc.)

## Backend — Better Auth Server

Better Auth runs server-side inside the `leapify-console` backend Worker. The backend uses:

- **Better Auth** with Google OAuth provider
- **Drizzle** ORM with D1 (Cloudflare SQLite) for user/session/account storage
- **Google OAuth** restricted to `dlsu.edu.ph` hosted domain (`GOOGLE_HD`)

Backend environment variables (set via `wrangler secret put`):

| Variable | Purpose |
|----------|---------|
| `BETTER_AUTH_SECRET` | Session encryption key |
| `BETTER_AUTH_URL` | Public URL for OAuth redirects |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_HD` | Restricts OAuth to `dlsu.edu.ph` |

## Frontend — Auth Service (`src/services/auth.ts`)

### Client Setup

```typescript
import { createLeapifyAuthClient, signInWithGoogleRedirect, getLeapifyToken, signOut as betterAuthSignOut } from 'leapify/client';

const API_URL = window.location.origin;
const authClient = createLeapifyAuthClient(API_URL);
```

`createLeapifyAuthClient()` creates a Better Auth client configured with:
- `baseURL` set to the current origin (proxied through the Worker)
- Bearer token auth type (sends session token in `Authorization` header)
- All standard Better Auth client methods (signIn, signOut, getSession, etc.)

### `signIn(callbackPath?)`

```typescript
export async function signIn(callbackPath = '/'): Promise<void> {
  const callbackURL = window.location.origin + callbackPath;
  await signInWithGoogleRedirect(authClient, callbackURL);
}
```

- Redirects the browser to Google's OAuth page
- After authentication, Google redirects back to the Better Auth callback endpoint (`/api/auth/callback/google`)
- Better Auth creates a session and redirects to `callbackURL`
- The session is stored as an HTTP-only cookie

### `signOut()`

```typescript
export async function signOut(): Promise<void> {
  await betterAuthSignOut(authClient);
}
```

- Calls Better Auth's sign-out endpoint (`/api/auth/sign-out`)
- Invalidates the session server-side

### `restoreSession()`

This is the critical function called on app initialization. It handles the OAuth redirect callback and restores the user session.

**Flow:**

1. **Read cookie session** — Directly fetches `/api/auth/get-session` with `credentials: 'include'`
   - Avoids using `authClient.getSession()` because it sends an empty Bearer token which causes Better Auth to ignore the cookie
   - Extracts the session token from the response and stores it in `localStorage` as `better-auth.session_token`

2. **Get token** — Calls `getLeapifyToken()` which reads the token from localStorage

3. **Set token on WS client** — Calls `leapifyApi.setToken(token)` so subsequent WebSocket requests include the Bearer token

4. **Fetch user profile** — Makes a direct HTTP GET to `/api/users/me` with the Bearer token
   - Uses HTTP (not WebSocket) because the WebSocket/Turnstile isn't ready during initial page load
   - The Worker proxies this request to the backend via its `/api/users/me` HTTP route
   - Returns the `UserProfile` or `null` if unauthenticated

### `getToken()`

```typescript
export async function getToken(): Promise<string | null> {
  return getLeapifyToken();
}
```

Returns the current session token from localStorage, or null for guests.

## Auth Hook (`src/hooks/useAuth.ts`)

```typescript
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On mount: restoreSession() → setUser(profile)
    // On unmount: cancelled flag to prevent state updates
  }, []);

  const handleSignOut = async () => {
    await authSignOut();
    leapifyApi.setToken(null);  // Clear WS auth token
    setUser(null);
  };

  return { user, loading, error, handleSignOut };
}
```

- Uses `scheduleInit(init)` to defer auth initialization (avoids blocking initial render)
- `handleSignOut()` clears both the Better Auth session and the WebSocket auth token

## Worker-Side Auth Proxy (`worker/index.ts`)

### `/api/auth/*` — OAuth & Session Routes

All requests to `/api/auth/*` are proxied to the backend:

```typescript
if (pathname.startsWith("/api/auth/")) {
  const targetUrl = `${backendUrl}${pathname}${url.search}`;
  // Forward headers, add X-Forwarded-Host/Proto for OAuth redirects
  // Use service binding (BACKEND) or HTTP fallback
  return upstream;
}
```

- Preserves the original request method, body, and query params
- Adds `X-Forwarded-Host` and `X-Forwarded-Proto` headers so the backend generates correct redirect URLs
- Uses `redirect: "manual"` to pass through 3xx redirects without following them
- Service binding (`env.BACKEND`) for direct Worker-to-Worker communication in production

### `/api/users/me` — User Profile (HTTP)

Dedicated HTTP route for fetching the user profile, used during session restoration:

```typescript
if (pathname === "/api/users/me" && request.method === "GET") {
  // Proxy to backend with auth headers
}
```

This exists as a separate HTTP route (not WebSocket) because:
- The WebSocket requires Turnstile to be solved first
- During initial page load, the Turnstile widget hasn't rendered yet
- Session restoration must happen before any UI is shown

### Authenticated WebSocket Requests

For authenticated WebSocket requests (bookmarks, sign-out), the client includes the Bearer token in each `WsApiRequest.token` field. The Worker forwards it as an `Authorization` header to the backend:

```typescript
if (req.token) {
  headers["Authorization"] = `Bearer ${req.token}`;
}
```

## Session Token Flow

```
1. User clicks "Sign in with Google"
2. Browser redirects to Google OAuth → user authenticates
3. Google redirects to /api/auth/callback/google?code=...
4. Better Auth backend exchanges code, creates session, sets HTTP-only cookie
5. Better Auth redirects to callbackURL (e.g., '/')
6. Frontend calls restoreSession()
7. Fetch /api/auth/get-session with credentials: 'include' → reads cookie session
8. Extract session.token, store in localStorage as 'better-auth.session_token'
9. Fetch /api/users/me with Bearer token → get UserProfile
10. Set user in useAuth hook → app renders authenticated state
```

## User Profile Type

The `UserProfile` from `leapify/types`:

```typescript
interface UserProfile {
  id: string;
  firebaseUid: string;  // Legacy field name, now stores Better Auth user ID
  email: string;
  name: string;
  role: UserRole;       // "student" | "admin" | "super_admin"
  image: string | null;
  createdAt: number;
}
```

> **Note:** The `firebaseUid` field name is a legacy artifact from the Firebase Auth migration. It now stores the Better Auth user ID. The backend schema may rename this to `betterAuthId` in a future cleanup.

## User-Scoped Features (Post-Auth)

After authentication, these features become functional via the WebSocket client:

| Feature | Endpoint | Method |
|---------|----------|--------|
| Get profile | `/users/me` | GET |
| Get bookmarks | `/users/me/bookmarks` | GET |
| Toggle bookmark | `/users/me/bookmarks/:eventId` | POST |
| Delete bookmark | `/users/me/bookmarks/:eventId` | DELETE |
| Sign out | `/auth/sign-out` | POST |

## Security

### Cookie-Based Sessions

Better Auth uses HTTP-only, secure cookies for session storage. The session token is not accessible via `document.cookie`. The frontend reads it indirectly via `/api/auth/get-session` response.

### Token in localStorage

After reading the session from the cookie, the token is stored in `localStorage` as `better-auth.session_token`. This allows the WebSocket client to send it as a Bearer token in subsequent requests.

### CORS & CSP

- CSP `frame-src` includes `https://accounts.google.com` for OAuth redirects
- CSP `connect-src` includes the backend origin for API calls
- Better Auth routes are proxied through the same origin, avoiding cross-origin issues

### Domain Restriction

Google OAuth is restricted to `dlsu.edu.ph` via the backend's `GOOGLE_HD` environment variable, which configures Better Auth's Google provider to only accept accounts from that domain.

## File Reference

| File | Purpose |
|------|---------|
| `src/services/auth.ts` | Frontend auth functions: signIn, signOut, restoreSession, getToken |
| `src/hooks/useAuth.ts` | React hook wrapping auth state |
| `src/services/leapify.ts` | WebSocket client with `setToken()` for auth header injection |
| `worker/index.ts` | Worker-side proxy for `/api/auth/*` and `/api/users/me` |
| `wrangler.jsonc` | Backend service binding, env vars |

## Dependencies

| Package | Purpose |
|---------|---------|
| `leapify` (`@access-dlsu/leapify`) | Backend package providing `leapify/client` (browser-safe Better Auth helpers) and `leapify/types` |

Import paths:
- `leapify/client` → `createLeapifyAuthClient`, `signInWithGoogleRedirect`, `getLeapifyToken`, `signOut`
- `leapify/types` → `UserProfile`, `LeapEvent`, `Faq`, etc.
