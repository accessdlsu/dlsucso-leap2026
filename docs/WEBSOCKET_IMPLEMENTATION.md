# WebSocket Implementation

## Overview

The project uses a **WebSocket-based API proxy** instead of traditional HTTP REST calls for all data-fetching requests. The browser communicates with the Cloudflare Worker edge over WebSocket, which then proxies requests to the backend (Leapify) service.

### Why WebSocket?

- **Anti-scraping:** API endpoints are not visible in Chrome DevTools Network tab (XHR/Fetch). Simple `curl`-based scraping is ineffective since the client never makes direct HTTP requests to `/api/*` data endpoints.
- **Single connection:** All API calls multiplex over one persistent WebSocket, reducing connection overhead.
- **Turnstile gating:** The WebSocket upgrade is gated behind a Cloudflare Turnstile challenge, so bots must solve a CAPTCHA before any API data is accessible.

## Architecture

```
Browser                          Cloudflare Worker (edge)           Backend (leapify-console)
┌─────────────┐                  ┌─────────────────────┐           ┌──────────────────┐
│  WsApiClient │──WebSocket──▶  │  handleWsMessage()  │──fetch──▶ │  Hono REST API   │
│  (leapify.ts)│◀──messages──── │  worker/index.ts     │◀─resp──── │  (Workers)       │
└─────────────┘                  └─────────────────────┘           └──────────────────┘
```

## Client Side — `WsApiClient` (`src/services/leapify.ts`)

### Class: `WsApiClient`

Singleton instance (`wsClient`) manages a single WebSocket connection to `/api` on the same origin.

**Key fields:**
- `ws: WebSocket | null` — the active socket
- `pending: Map<string, PendingRequest>` — in-flight requests keyed by UUID
- `authToken: string | null` — Bearer token for authenticated requests
- `getCache: Map<string, unknown>` — client-side cache for select GET paths (e.g., `/faqs`)

### Connection Lifecycle

1. **`ensureConnected()`** — called before every request
   - If socket is already `OPEN`, returns immediately
   - If a connection attempt is in progress, awaits it
   - Otherwise, initiates a new connection:
     1. Solves the Turnstile challenge (if not already solved)
     2. Constructs `wss://<origin>/api?turnstile_token=<token>`
     3. Creates `new WebSocket(url)`
     4. Sets up `onopen`, `onmessage`, `onclose`, `onerror` handlers
     5. Resolves the `connecting` promise on `onopen`

2. **`onmessage`** — parses incoming `WsApiResponse`, matches by `id`, resolves/rejects the corresponding `PendingRequest`
   - Success (2xx): unwraps the `{ data: T }` envelope, rewrites upload URLs
   - Error (4xx/5xx): rejects with the error message

3. **`onclose`** — rejects all pending requests with "WebSocket connection closed"

### Request/Response Protocol

Each request sends a JSON message over the WebSocket:

```typescript
interface WsApiRequest {
  id: string;       // crypto.randomUUID()
  method: string;   // "GET", "POST", "DELETE"
  path: string;     // "/classes", "/users/me/bookmarks"
  token?: string;   // Bearer token (if authenticated)
  body?: string;    // JSON-stringified body for non-GET
}
```

The server responds with:

```typescript
interface WsApiResponse {
  id: string;       // matches the request id
  status: number;   // HTTP status code
  body: unknown;    // response payload
}
```

### Request Timeout

Each request has a 30-second timeout (`WS_REQUEST_TIMEOUT_MS`). On timeout, the pending request is rejected and removed.

### Client-Side Caching

Certain GET paths (currently only `/faqs`) are cached in `getCache`. Subsequent requests to cached paths return the cached value without hitting the server.

### Upload URL Rewriting

The `rewriteUploadUrls()` function recursively transforms `/api/uploads/...` paths to `/data/...` in all response bodies, so the frontend can fetch uploaded files through the Worker's `/data/*` proxy route.

### Public API (`leapifyApi`)

The exported `leapifyApi` object wraps `wsClient.request()` with typed methods:

| Method | HTTP | Path | Auth Required |
|--------|------|------|---------------|
| `getEvents()` | GET | `/classes` | No |
| `getEvent(slug)` | GET | `/classes/:slug` | No |
| `getSlots(slug)` | GET | `/classes/:slug/slots` | No |
| `getThemes()` | GET | `/themes` | No |
| `getOrganizations()` | GET | `/organizations` | No |
| `getFaqs()` | GET | `/faqs` | No |
| `getConfig()` | GET | `/config` | No |
| `getHealth()` | GET | `/api/health` | No (direct HTTP) |
| `getMe()` | GET | `/users/me` | Yes |
| `signOut()` | POST | `/auth/sign-out` | Yes |
| `getBookmarks()` | GET | `/users/me/bookmarks` | Yes |
| `toggleBookmark(eventId)` | POST | `/users/me/bookmarks/:id` | Yes |
| `deleteBookmark(eventId)` | DELETE | `/users/me/bookmarks/:id` | Yes |

`getHealth()` is the only method that uses direct HTTP (`fetch("/api/health")`) instead of WebSocket.

## Server Side — Worker (`worker/index.ts`)

### WebSocket Upgrade — `handleWebSocketUpgrade()`

Triggered when the request path is `/api` and the `Upgrade: websocket` header is present.

1. Creates a `WebSocketPair` — `client` (returned in the 101 response) and `server` (accepted on the Worker side)
2. Calls `server.accept()` to accept the connection
3. Validates Turnstile token **asynchronously** via `ctx.waitUntil()`:
   - Extracts `turnstile_token` from the URL query params
   - If `TURNSTILE_SECRET_KEY` is set and no token is provided, closes with `1008`
   - Verifies the token against `https://challenges.cloudflare.com/turnstile/v0/siteverify`
   - On failure, closes the socket with `1008`
4. Registers `message`, `close`, `error` event listeners on the server socket
5. Returns `new Response(null, { status: 101, webSocket: client })` immediately (synchronous 101)

### Message Handling — `handleWsMessage()`

For each incoming WebSocket message:

1. Parses the JSON as `WsApiRequest`
2. Constructs headers: `X-Forwarded-For`, `Authorization` (if token present), `Content-Type`
3. Forwards the request to the backend:
   - **Service binding** (`env.BACKEND`): direct Worker-to-Worker `fetch()` (production)
   - **HTTP fallback**: `fetch(backendUrl + "/api" + path)` (local dev / `lh` env)
4. Parses the upstream response (JSON or text)
5. Wraps Cloudflare error pages in a structured JSON error envelope
6. Sends the `WsApiResponse` back to the client via `safeWsSend()`
7. On error, sends a 502 response with `PROXY_ERROR` code

### `safeWsSend()`

Utility that sends data on a WebSocket only if `readyState === 1` (OPEN), catching any errors from already-closed sockets.

## Turnstile Integration

### Client Side (`src/services/leapify.ts`)

- `solveTurnstileChallenge()` — loads the Turnstile script, renders the widget into a container, waits for the callback token
- `signalTurnstileContainer(el)` — called by App.tsx when the loading screen renders, so the widget has a DOM element
- `onTurnstileError(callback)` — registers a callback for displaying Turnstile errors to the user
- The Turnstile token is passed as a query parameter (`turnstile_token`) when establishing the WebSocket connection

### Worker Side (`worker/index.ts`)

- `verifyTurnstileToken(secret, token, ip)` — POSTs to Cloudflare's siteverify endpoint
- Validation is async (`ctx.waitUntil`) so the 101 response is sent immediately
- If validation fails, the socket is closed with code `1008` ("Policy Violation")

## Routing

### `_routes.json`

```json
{
  "include": ["/api/*", "/data/*"],
  "exclude": []
}
```

Routes matching `/api` and `/data/*` are handled by the Worker. Everything else is served from static assets.

### `wrangler.jsonc` — `run_worker_first`

The `assets.run_worker_first` array ensures `/api` and `/data/*` are intercepted by the Worker before matching static files:

```json
"run_worker_first": ["/api", "/api/*", "/data", "/data/*"]
```

## Data Proxy — `/data/*`

Uploaded files (images, assets) are proxied through the Worker at `/data/*`:

```
GET /data/some-file.jpg  →  GET backendUrl/api/uploads/some-file.jpg
```

The client-side `rewriteUploadUrls()` automatically converts `/api/uploads/...` paths in API responses to `/data/...`, so all file URLs go through this proxy.

## Error Handling

| Scenario | Client Behavior |
|----------|----------------|
| Turnstile fails | Warns user, attempts connection anyway (Worker may skip validation with test keys) |
| WebSocket creation fails | Rejects with error |
| Request timeout (30s) | Rejects with timeout error |
| Socket closes mid-request | All pending requests rejected |
| Upstream 4xx/5xx | Error message extracted from response body |
| Upstream network error | 502 with `PROXY_ERROR` code |

## File Reference

| File | Purpose |
|------|---------|
| `src/services/leapify.ts` | Client-side WebSocket client, Turnstile, public API |
| `worker/index.ts` | Worker-side WebSocket proxy, Turnstile verification, routing |
| `public/_routes.json` | Cloudflare Pages routing config |
| `wrangler.jsonc` | Worker config, service bindings, env vars |
