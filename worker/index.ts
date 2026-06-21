/**
 * DLSU CSO LEAP 2026 — Cloudflare Worker Entry Point
 *
 * Handles:
 *  1. WebSocket API proxy at `/api` (anti-scraping: no visible XHR/Fetch in DevTools)
 *  2. Uploaded file proxy at `/data/*`
 *  3. Lightweight `/api/health` uptime endpoint
 *  4. Static asset serving via ASSETS binding for everything else
 */

export interface Env {
  /** Backend URL — set via `wrangler secret put LEAPIFY_API_URL` */
  LEAPIFY_API_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Set to "true" in .dev.vars to enable dev bypass on non-localhost origins (e.g. reverse proxy). */
  DEV_BYPASS?: string;
  /** Direct Worker-to-Worker service binding (production) */
  BACKEND?: Fetcher;
  /** Static assets binding — serves files from dist/client/ */
  ASSETS?: Fetcher;
  /** Durable Object for broadcasting config updates to all connected clients */
  BROADCASTER?: DurableObjectNamespace;
}

// ── Config Broadcaster Durable Object ─────────────────────────────────────────

export class ConfigBroadcaster implements DurableObject {
  private env: Env;

  constructor(
    private state: DurableObjectState,
    env: Env,
  ) {
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
    const { 0: client, 1: server } = new WebSocketPair();
    this.state.acceptWebSocket(server);

    // Ensure alarm is scheduled so broadcasts will fire
    const existing = await this.state.storage.getAlarm();
    if (!existing) {
      await this.state.storage.setAlarm(Date.now() + 15_000);
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async alarm(): Promise<void> {
    const sockets = this.state.getWebSockets();
    if (sockets.length === 0) return; // No clients — let alarm lapse

    try {
      const res = await backendFetch(this.env, "/api/config", {
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: Record<string, unknown> };
        if (json?.data) {
          const config = { ...json.data };
          delete config.allowedOrigins;
          const payload = JSON.stringify({ type: "config_update", data: config });
          for (const ws of sockets) {
            try {
              ws.send(payload);
            } catch {
              // Client disconnected — hibernation API cleans it up automatically
            }
          }
        }
      } else if (res.status === 503) {
        // Backend maintenance middleware blocks all routes — treat as maintenanceMode
        const payload = JSON.stringify({
          type: "config_update",
          data: { maintenanceMode: true, comingSoonUntil: null, now: Math.floor(Date.now() / 1000) },
        });
        for (const ws of sockets) {
          try { ws.send(payload); } catch {}
        }
      }
    } catch {
      // Backend unreachable — skip this tick, reschedule anyway
    }

    await this.state.storage.setAlarm(Date.now() + 15_000);
  }

  webSocketMessage(_ws: WebSocket, _message: string | ArrayBuffer): void {
    // Config-only sockets don't send messages — ignore
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    try { ws.close(code, reason); } catch {}
  }

  webSocketError(_ws: WebSocket, _error: unknown): void {
    // Hibernation API handles cleanup
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=UTF-8" },
  });
}

/**
 * True when dev mode is active.
 * Primary check: Host header is localhost/127.0.0.1 (cannot be spoofed in production —
 * Cloudflare always sets the real incoming domain).
 * Secondary check: DEV_BYPASS env var set to "true" in .dev.vars (for reverse-proxy
 * local dev where the Host header is a real domain like leap.wincs.dev).
 * DEV_BYPASS is never set in production wrangler secrets, so it cannot be activated there.
 */
function isLocalDev(request: Request, env?: Env): boolean {
  const host = request.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") || env?.DEV_BYPASS === "true";
}

/**
 * Fetch from the leapify backend.
 *
 * Priority:
 *  1. `env.LEAPIFY_API_URL` (set in .dev.vars for local dev) — direct HTTP.
 *     In local dev the BACKEND service binding is always [not connected], so
 *     trying it first returns an error response immediately and silently breaks
 *     routing. Checking LEAPIFY_API_URL first avoids that entirely.
 *  2. `env.BACKEND` (Worker-to-Worker service binding) — production only.
 *     In production LEAPIFY_API_URL is never set, so the binding is always used.
 *     The binding routes purely on path; the hostname in the Request URL is a
 *     stable placeholder that never reaches the network.
 *
 * Throws if neither is configured.
 */
async function backendFetch(env: Env, path: string, init?: RequestInit, baseOrigin?: string): Promise<Response> {
  if (env.LEAPIFY_API_URL) {
    return fetch(`${env.LEAPIFY_API_URL}${path}`, init);
  }
  if (env.BACKEND) {
    const origin = baseOrigin || "https://worker";
    return env.BACKEND.fetch(new Request(`${origin}${path}`, init));
  }
  throw new Error("Backend not configured: set LEAPIFY_API_URL in .dev.vars or bind BACKEND service");
}

// ── WebSocket Protocol Types ──────────────────────────────────────────────────

interface WsApiRequest {
  id: string;
  method: string;
  path: string;
  token?: string;
  body?: string;
}

interface WsApiResponse {
  id: string;
  status: number;
  body: unknown;
}

// ── Turnstile ─────────────────────────────────────────────────────────────────

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstileToken(
  secret: string,
  token: string,
  ip: string | null,
): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) formData.append("remoteip", ip);
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: AbortSignal.timeout(5000),
    });
    const outcome = (await res.json()) as { success: boolean };
    return outcome.success;
  } catch (err) {
    console.error("[worker] Turnstile verification failed");
    return false;
  }
}

// ── WebSocket Proxy ───────────────────────────────────────────────────────────

function safeWsSend(server: WebSocket, data: string): void {
  try {
    if (server.readyState === 1) server.send(data);
  } catch {
    // Socket already closed — nothing we can do.
  }
}

async function handleWsMessage(
  server: WebSocket,
  request: Request,
  env: Env,
  event: MessageEvent,
): Promise<void> {
  let reqId = "unknown";
  try {
    const req: WsApiRequest = JSON.parse(event.data as string);
    reqId = req.id;

    if (configOnlySockets.has(server)) {
      safeWsSend(
        server,
        JSON.stringify({
          id: reqId,
          status: 403,
          body: {
            error: { code: "FORBIDDEN", message: "Config-only socket cannot make API requests" },
          },
        } satisfies WsApiResponse),
      );
      return;
    }

    if (!env.BACKEND && !env.LEAPIFY_API_URL) {
      safeWsSend(
        server,
        JSON.stringify({
          id: req.id,
          status: 500,
          body: {
            error: { code: "CONFIG_ERROR", message: "Backend URL not configured" },
          },
        } satisfies WsApiResponse),
      );
      return;
    }

    const handshakeOrigin = new URL(request.url).origin;
    const headers: Record<string, string> = {
      "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
      "Referer": request.headers.get("Referer") || request.headers.get("Origin") || handshakeOrigin,
      "Origin": request.headers.get("Origin") || handshakeOrigin,
    };

    if (req.token) headers["Authorization"] = `Bearer ${req.token}`;
    if (req.body && req.method !== "GET" && req.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
    }

    const fetchInit: RequestInit = {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(15_000),
    };
    if (req.body && req.method !== "GET" && req.method !== "HEAD") {
      fetchInit.body = req.body;
    }

    const targetPath = `/api${req.path}`;
    console.log(`[worker] WS proxy: ${req.method} ${req.path}`);

    const baseOrigin = new URL(request.url).origin;
    const upstream = await backendFetch(env, targetPath, fetchInit, baseOrigin);

    const contentType = upstream.headers.get("content-type") || "";
    let body: unknown;
    if (contentType.includes("application/json")) {
      body = await upstream.json();
    } else {
      const text = await upstream.text();
      if (text.startsWith("error code:") || text.includes("CF error")) {
        body = { error: { code: "UPSTREAM_ERROR", message: "Backend error" } };
      } else {
        body = text;
      }
    }

    safeWsSend(
      server,
      JSON.stringify({ id: req.id, status: upstream.status, body } satisfies WsApiResponse),
    );
  } catch (err) {
    safeWsSend(
      server,
      JSON.stringify({
        id: reqId,
        status: 502,
        body: {
          error: {
            code: "PROXY_ERROR",
            message: "Failed to proxy request",
          },
        },
      } satisfies WsApiResponse),
    );
    console.error("[worker] WebSocket proxy error");
  }
}

// ── WebSocket Active Sockets ───────────────────────────────────────────────────

const activeSockets = new Set<WebSocket>();
const configOnlySockets = new Set<WebSocket>();
let lastConfigStr = "";

function broadcastConfig(config: Record<string, unknown>) {
  const cleanConfig = { ...config };
  delete cleanConfig.allowedOrigins;
  const configStr = JSON.stringify(cleanConfig);
  if (configStr === lastConfigStr) return;
  lastConfigStr = configStr;
}

async function handleWebSocketUpgrade(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const isConfigOnly = url.searchParams.get("type") === "config";

  // Config-only sockets → Durable Object (hibernation API, broadcasts config_update)
  if (isConfigOnly && env.BROADCASTER) {
    const id = env.BROADCASTER.idFromName("global");
    const stub = env.BROADCASTER.get(id);
    return stub.fetch(request);
  }

  // Full API proxy sockets — handled in this worker
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  server.accept();

  activeSockets.add(server);
  if (isConfigOnly) {
    configOnlySockets.add(server);
  }

  // Validate Turnstile only for full-access client WebSocket connections
  const cookie = request.headers.get("Cookie") ?? "";
  const hasSession = !!getSessionToken(cookie);

  if (!isConfigOnly && env.TURNSTILE_SECRET_KEY && !hasSession) {
    const turnstileToken = url.searchParams.get("turnstile_token");
    if (!turnstileToken) {
      server.close(1008, "Turnstile token required");
      return new Response(null, { status: 101, webSocket: client });
    }
    const ip = request.headers.get("CF-Connecting-IP");
    ctx.waitUntil(
      verifyTurnstileToken(env.TURNSTILE_SECRET_KEY, turnstileToken, ip)
        .then((valid) => {
          if (!valid) {
            console.warn("[worker] Turnstile validation failed, closing WebSocket");
            try { server.close(1008, "Turnstile verification failed"); } catch { /* already closed */ }
          }
        })
        .catch((err) => {
          console.error("[worker] Turnstile verification error");
          try { server.close(1008, "Turnstile verification error"); } catch { /* already closed */ }
        }),
    );
  }

  server.addEventListener("message", (event) => {
    ctx.waitUntil(handleWsMessage(server, request, env, event));
  });

  server.addEventListener("close", (event) => {
    console.log("[worker] WebSocket closed:", event.code, event.reason);
    activeSockets.delete(server);
    configOnlySockets.delete(server);
    try { server.close(); } catch { /* already closed */ }
  });

  server.addEventListener("error", (event) => {
    console.error("[worker] WebSocket error");
    activeSockets.delete(server);
    configOnlySockets.delete(server);
    try { server.close(); } catch { /* already closed */ }
  });

  return new Response(null, { status: 101, webSocket: client });
}

// ── API Routes ────────────────────────────────────────────────────────────────

async function handleApiRequest(
  request: Request,
  env: Env,
  pathname: string,
  ctx: ExecutionContext,
): Promise<Response | null> {
  const baseOrigin = new URL(request.url).origin;

  // GET /api/health — uptime check
  if (pathname === "/api/health" && request.method === "GET") {
    return jsonResponse({
      status: "ok",
      project: "dlsucso-leap2026",
      timestamp: new Date().toISOString(),
    });
  }

  // WebSocket upgrade at /api
  if (
    pathname === "/api" &&
    request.headers.get("Upgrade")?.toLowerCase() === "websocket"
  ) {
    return handleWebSocketUpgrade(request, env, ctx);
  }

  // GET /data/* — proxy uploaded files from backend
  if (pathname.startsWith("/data/") && request.method === "GET") {
    const filename = pathname.slice("/data/".length);
    if (filename.includes("..") || filename.startsWith("/")) {
      return jsonResponse({ error: "Invalid file path" }, 400);
    }
    const backendPath = `/api/uploads/${filename}`;

    // Use a synthetic https:// URL as the cache key (required by the Cache API)
    const cacheKey = new Request(`https://data-cache/${filename}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let upstream: Response;
    try {
      upstream = await backendFetch(env, backendPath, { method: "GET", signal: AbortSignal.timeout(15_000) }, baseOrigin);
    } catch {
      return jsonResponse({ error: "Backend not configured" }, 500);
    }

    const respHeaders = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) respHeaders.set("Content-Type", ct);
    const cc = upstream.headers.get("cache-control");
    if (cc) respHeaders.set("Cache-Control", cc);
    const etag = upstream.headers.get("etag");
    if (etag) respHeaders.set("ETag", etag);

    const response = new Response(upstream.body, { status: upstream.status, headers: respHeaders });

    // Only cache successful responses with a cacheable Cache-Control
    if (upstream.status === 200 && cc) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  }

  // GET /api/config — public config (used by countdown before WS is ready)
  // Sensitive internal fields (allowedOrigins) are stripped before sending to the browser.
  if (pathname === "/api/config" && request.method === "GET") {
    if (!env.BACKEND && !env.LEAPIFY_API_URL) return jsonResponse({ error: "Backend not configured" }, 500);
    let upstream: Response;
    try {
      upstream = await backendFetch(env, "/api/config", { signal: AbortSignal.timeout(5_000) }, baseOrigin);
    } catch {
      return jsonResponse({ error: "Backend not configured" }, 500);
    }
    const json = await upstream.json() as { data?: Record<string, unknown> };
    // Strip fields that expose internal infrastructure
    if (json?.data) {
      delete json.data.allowedOrigins;
    }
    return new Response(JSON.stringify(json), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  return null;
}

// ── Session & Admin Helpers ─────────────────────────────────────────────

/**
 * Extract the Better Auth session token from the Cookie header.
 * Returns null if no session token is present.
 */
function getSessionToken(cookie: string): string | null {
  const match = cookie.match(
    /(?:^|;\s*)(?:__secure-)?better-auth\.session_token=([^;]+)/,
  );
  return match ? match[1] : null;
}

/**
 * Verify that the user associated with the session cookie has an admin role.
 * Calls backend GET /api/users/me with the session token as Bearer token.
 * This is called on every request during gated mode — no client-side caching.
 */
async function isAdminUser(env: Env, cookie: string, baseOrigin?: string): Promise<boolean> {
  const token = getSessionToken(cookie);
  if (!token) return false;
  try {
    const res = await backendFetch(env, "/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
    }, baseOrigin);
    if (!res.ok) {
      console.warn("[worker] Admin check: /api/users/me returned", res.status);
      return false;
    }
    const json = (await res.json()) as {
      data?: { role?: string };
      role?: string;
    };
    // Accept both { data: { role } } and flat { role } response shapes
    const role = json?.data?.role || json?.role;
    return role === "admin" || role === "super_admin";
  } catch (err) {
    console.warn("[worker] Admin check failed");
    return false;
  }
}

// ── Index Routing (maintenance / countdown / home) ────────────────────────

interface SiteConfig {
  maintenanceMode: boolean;
  comingSoonUntil: number | null;
  enhancementsMode: boolean;
  enhancementsUntil: number | null;
  now: number;
}

/**
 * Serve the right page at `/` based on site config.
 * Auto-detected from the Host header: bypasses are active on localhost/127.0.0.1 only.
 * Cannot be activated by users in production — CF enforces the real incoming host.
 */
async function routeIndex(
  request: Request,
  env: Env,
): Promise<Response | null> {
  const dev = isLocalDev(request, env);
  const cookie = request.headers.get("Cookie") ?? "";
  const baseOrigin = new URL(request.url).origin;

  // Dev override: ?_view=maintenance|countdown|home|login forces a specific view
  if (dev) {
    const view = new URL(request.url).searchParams.get("_view");
    if (view === "maintenance") {
      return env.ASSETS.fetch(new Request(new URL("/maintenance/", request.url).toString()));
    }
    if (view === "countdown") {
      return env.ASSETS.fetch(new Request(new URL("/countdown/", request.url).toString()));
    }
    if (view === "home") return null; // fall through to index.html
  }

  if (!env.BACKEND && !env.LEAPIFY_API_URL) return null;

  let config: SiteConfig | null = null;

  try {
    const configRes = await backendFetch(env, "/api/config", { signal: AbortSignal.timeout(3_000) }, baseOrigin);

    // The leapify maintenance middleware blocks ALL routes (including /api/config)
    // when maintenance mode is active, returning 503. Since we can't read the config
    // in this state, treat 503 as maintenance mode directly.
    if (configRes.status === 503 && !dev) {
      config = { maintenanceMode: true, comingSoonUntil: null, now: Math.floor(Date.now() / 1000) };
      broadcastConfig(config);
    } else if (configRes.ok) {
      const json = (await configRes.json()) as { data?: SiteConfig };
      config = json.data || null;
      if (config) {
        broadcastConfig(config);
      }
    }
  } catch (err) {
    console.warn("[worker] Config fetch failed, trying cached config");
  }

  // Fallback to last known configuration if fetch failed
  if (!config && lastConfigStr) {
    try {
      config = JSON.parse(lastConfigStr) as SiteConfig;
    } catch {}
  }

  // If still no config (first load failed to fetch backend), default to maintenance
  if (!config) {
    return env.ASSETS.fetch(new Request(new URL("/maintenance/", request.url).toString()));
  }

  const now = config.now * 1000;
  const hasSession = !!getSessionToken(cookie);

  // ── Admin / role gate ─────────────────────────────────────────────────
  // When maintenance or coming-soon is active (and not local dev), verify
  // the user's admin role on every request via the backend. No client-side
  // caching — the _admin cookie is never set or trusted for auth decisions.
  // Admins see the gate page with _admin_gate=1 cookie so the frontend shows
  // an "Enter Site" button. Clicking it navigates to /?_enter which re-verifies
  // admin server-side before serving the site. Non-admins (with or without session)
  // see the gate page normally — no redirect, no reload loop.

  // Admin enter bypass: ?_enter on / re-verifies admin and serves the site.
  const wantsEnter = new URL(request.url).searchParams.has("_enter");

  // If admin already clicked "Enter Site", bypass all gates for subsequent navigations.
  // Without ClientRouter, every page nav is a full request — this prevents gate loops.
  const adminEntered = cookie.includes("_admin_entered=1");
  if (adminEntered && hasSession) {
    return null; // fall through to ASSETS
  }

  if (config.maintenanceMode && !dev) {
    if (hasSession) {
      const isAdmin = await isAdminUser(env, cookie, baseOrigin);
      if (isAdmin && wantsEnter) {
        // Admin entered — serve site and stamp _admin_entered cookie so Layout skips reload
        const res = await env.ASSETS.fetch(request);
        const headers = new Headers(res.headers);
        headers.append("Set-Cookie", "_admin_entered=1; Path=/; SameSite=Strict");
        return new Response(res.body, { status: res.status, headers });
      }
      const gatePage = new URL("/maintenance/", request.url).toString();
      const res = await env.ASSETS.fetch(new Request(gatePage));
      const headers = new Headers(res.headers);
      headers.append("Set-Cookie", isAdmin
        ? "_admin_gate=1; Path=/; SameSite=Strict; Max-Age=300"
        : "_non_admin=1; Path=/; SameSite=Strict; Max-Age=300");
      return new Response(res.body, { status: res.status, headers });
    }
    return env.ASSETS.fetch(new Request(new URL("/maintenance/", request.url).toString()));
  }

  if (config.comingSoonUntil && config.comingSoonUntil * 1000 > now && !dev) {
    if (hasSession) {
      const isAdmin = await isAdminUser(env, cookie, baseOrigin);
      if (isAdmin && wantsEnter) {
        // Admin entered — serve site and stamp _admin_entered cookie so Layout skips reload
        const res = await env.ASSETS.fetch(request);
        const headers = new Headers(res.headers);
        headers.append("Set-Cookie", "_admin_entered=1; Path=/; SameSite=Strict");
        return new Response(res.body, { status: res.status, headers });
      }
      const gatePage = new URL("/countdown/", request.url).toString();
      const res = await env.ASSETS.fetch(new Request(gatePage));
      const headers = new Headers(res.headers);
      headers.append("Set-Cookie", isAdmin
        ? "_admin_gate=1; Path=/; SameSite=Strict; Max-Age=300"
        : "_non_admin=1; Path=/; SameSite=Strict; Max-Age=300");
      return new Response(res.body, { status: res.status, headers });
    }
    return env.ASSETS.fetch(new Request(new URL("/countdown/", request.url).toString()));
  }

  if (config.enhancementsMode && !dev) {
    if (hasSession) {
      const isAdmin = await isAdminUser(env, cookie, baseOrigin);
      if (isAdmin && wantsEnter) {
        const res = await env.ASSETS.fetch(request);
        const headers = new Headers(res.headers);
        headers.append("Set-Cookie", "_admin_entered=1; Path=/; SameSite=Strict");
        return new Response(res.body, { status: res.status, headers });
      }
      const gatePage = new URL("/enhancements/", request.url).toString();
      const res = await env.ASSETS.fetch(new Request(gatePage));
      const headers = new Headers(res.headers);
      headers.append("Set-Cookie", isAdmin
        ? "_admin_gate=1; Path=/; SameSite=Strict; Max-Age=300"
        : "_non_admin=1; Path=/; SameSite=Strict; Max-Age=300");
      return new Response(res.body, { status: res.status, headers });
    }
    return env.ASSETS.fetch(new Request(new URL("/enhancements/", request.url).toString()));
  }

  // ── Session gate ──────────────────────────────────────────────────────
  // Site is public: no maintenance, no coming-soon — just require login.

  if (!hasSession) {
    return env.ASSETS.fetch(new Request(new URL("/login/", request.url).toString()));
  }

  return null;
}


// ── Main Fetch Handler ─────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname.startsWith("/api") || pathname.startsWith("/data")) {
      const apiResponse = await handleApiRequest(request, env, pathname, ctx);
      if (apiResponse) return apiResponse;

      // Fallback: only specific routes may bypass the WebSocket gate via plain HTTP.
      //   /api/auth/**   — OAuth redirect flows (sign-in, callbacks, session)
      //   /api/users/me  — fetched directly with Bearer token by auth.ts before WS is ready
      // All other /api/* routes must go through the WebSocket at /api (Turnstile enforced).
      const isHttpAllowed =
        pathname.startsWith('/api/auth/') ||
        pathname === '/api/users/me';
      if (!isHttpAllowed) {
        return jsonResponse({ error: 'Forbidden' }, 403)
      }

      try {
        const headers = new Headers(request.headers);
        headers.set("X-Forwarded-Host", url.host);
        headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

        // Strip the browser's Origin — the backend resolves its baseURL from
        // X-Forwarded-* headers. Forwarding the raw browser Origin triggers
        // CORS processing in the backend even though this is an internal proxy
        // hop; if the dev origin (e.g. http://127.0.0.1:8787) isn't in the
        // allowed-origins list the response's Set-Cookie gets dropped by the
        // browser.
        headers.delete("Origin");

        return await backendFetch(env, pathname + url.search, {
          method: request.method,
          headers,
          body: request.method !== "GET" && request.method !== "HEAD" ? await request.clone().blob() : undefined,
          redirect: "manual", // Crucial: lets the browser follow OAuth 302 redirects instead of following them internally
        }, url.origin);
      } catch (err) {
        console.error("[worker] Failed to proxy API request");
        return jsonResponse({ error: "Upstream gateway error" }, 502);
      }
    }

    // /countdown, /maintenance, and /login are only served via worker routing at /.
    // Redirect browser navigations (Accept: text/html) so they can't be bookmarked/scraped.
    // Server-side fetches (e.g. astro build prerender) don't include text/html in Accept,
    // so they fall through and get the actual HTML — keeping astro build working with one config.
    if (
      request.method === "GET" &&
      (pathname.startsWith("/countdown") || pathname.startsWith("/maintenance") || pathname.startsWith("/enhancements")) &&
      (request.headers.get("Accept") ?? "").includes("text/html")
    ) {
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // For all browser HTML navigations, enforce auth + gate checks.
    // This covers /, /faq, /classes, /events, /about, etc. — any page
    // a user could directly navigate to. routeIndex returns null when the
    // site is open and the user is authenticated (fall through to ASSETS).
    // /login is excluded so admins can authenticate even during maintenance/countdown.
    const isLoginPage = pathname === "/login" || pathname === "/login/";
    if (
      request.method === "GET" &&
      (request.headers.get("Accept") ?? "").includes("text/html") &&
      !isLoginPage
    ) {
      const routed = await routeIndex(request, env);
      if (routed) return routed;
    }

    if (!env.ASSETS) return jsonResponse({ error: "Not found" }, 404);
    const assetRes = await env.ASSETS.fetch(request);

    // Stamp _dev=1 cookie on HTML pages when running in local dev.
    // Client-side bypass bar reads this cookie to decide whether to show.
    const devActive = isLocalDev(request, env);
    if (devActive) {
      const ct = assetRes.headers.get("content-type") ?? "";
      if (ct.includes("text/html")) {
        const headers = new Headers(assetRes.headers);
        headers.append("Set-Cookie", "_dev=1; Path=/; SameSite=Lax; Max-Age=86400");
        return new Response(assetRes.body, {
          status: assetRes.status,
          statusText: assetRes.statusText,
          headers,
        });
      }
    }

    return assetRes;
  },
} satisfies ExportedHandler<Env>;
