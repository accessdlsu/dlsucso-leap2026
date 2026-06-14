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
  /** Direct Worker-to-Worker service binding (production) */
  BACKEND?: Fetcher;
  /** Static assets binding — serves files from dist/client/ */
  ASSETS?: Fetcher;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=UTF-8" },
  });
}

/**
 * True when the worker is running under wrangler dev (local machine).
 * Detected via the Host header which Cloudflare's edge always sets to the
 * real incoming domain — in production it is never localhost or 127.0.0.1,
 * so this check cannot be spoofed by users.
 */
function isLocalDev(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
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
async function backendFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  if (env.LEAPIFY_API_URL) {
    return fetch(`${env.LEAPIFY_API_URL}${path}`, init);
  }
  if (env.BACKEND) {
    // Placeholder hostname — binding ignores it, only the path is used for routing.
    return env.BACKEND.fetch(new Request(`https://worker${path}`, init));
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
    console.error("[worker] Turnstile verification failed:", err);
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

    const headers: Record<string, string> = {
      "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
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

    const upstream = await backendFetch(env, targetPath, fetchInit);

    const contentType = upstream.headers.get("content-type") || "";
    let body: unknown;
    if (contentType.includes("application/json")) {
      body = await upstream.json();
    } else {
      const text = await upstream.text();
      if (text.startsWith("error code:") || text.includes("CF error")) {
        body = { error: { code: "UPSTREAM_ERROR", message: text.trim() } };
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
            message: err instanceof Error ? err.message : "Failed to proxy request",
          },
        },
      } satisfies WsApiResponse),
    );
    console.error("[worker] WebSocket proxy error:", err);
  }
}

// ── WebSocket Active Sockets & Config Polling ──────────────────────────────────

const activeSockets = new Set<WebSocket>();
const configOnlySockets = new Set<WebSocket>();
let lastConfigStr = "";
let pollerRunning = false;

function broadcastConfig(config: any) {
  const cleanConfig = { ...config };
  delete cleanConfig.allowedOrigins;

  const configStr = JSON.stringify(cleanConfig);
  if (configStr === lastConfigStr) return;
  lastConfigStr = configStr;

  console.log(`[worker] Config changed, broadcasting to ${activeSockets.size} clients`);
  const payload = JSON.stringify({
    type: "config_update",
    data: cleanConfig,
  });

  for (const socket of activeSockets) {
    try {
      if (socket.readyState === 1) { // OPEN
        socket.send(payload);
      } else {
        activeSockets.delete(socket);
        configOnlySockets.delete(socket);
      }
    } catch {
      activeSockets.delete(socket);
      configOnlySockets.delete(socket);
    }
  }
}

async function startConfigPoller(env: Env, ctx: ExecutionContext) {
  if (pollerRunning) return;
  pollerRunning = true;

  const poll = async () => {
    if (activeSockets.size === 0) {
      pollerRunning = false;
      return;
    }

    try {
      const res = await backendFetch(env, "/api/config", { signal: AbortSignal.timeout(3000) });
      if (res.status === 503) {
        // Under maintenance status
        const mockConfig = { maintenanceMode: true, comingSoonUntil: null, now: Math.floor(Date.now() / 1000) };
        broadcastConfig(mockConfig);
      } else if (res.ok) {
        const json = await res.json() as { data?: any };
        if (json?.data) {
          broadcastConfig(json.data);
        }
      }
    } catch (err) {
      console.error("[worker] Poller failed to check config:", err);
    }

    // Schedule next poll in 3 seconds
    setTimeout(() => {
      ctx.waitUntil(poll());
    }, 3000);
  };

  ctx.waitUntil(poll());
}

function handleWebSocketUpgrade(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Response {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  server.accept();

  const url = new URL(request.url);
  const isConfigOnly = url.searchParams.get("type") === "config";

  activeSockets.add(server);
  if (isConfigOnly) {
    configOnlySockets.add(server);
  }


  // Start the background poller if needed
  startConfigPoller(env, ctx);

  // Validate Turnstile only for full-access client WebSocket connections
  if (!isConfigOnly && env.TURNSTILE_SECRET_KEY) {
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
          console.error("[worker] Turnstile verification error:", err);
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
    console.error("[worker] WebSocket error:", event);
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
    const backendPath = `/api/uploads/${pathname.slice("/data/".length)}`;

    let upstream: Response;
    try {
      upstream = await backendFetch(env, backendPath, { method: "GET", signal: AbortSignal.timeout(15_000) });
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

    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  }

  // GET /api/config — public config (used by countdown before WS is ready)
  // Sensitive internal fields (allowedOrigins) are stripped before sending to the browser.
  if (pathname === "/api/config" && request.method === "GET") {
    if (!env.BACKEND && !env.LEAPIFY_API_URL) return jsonResponse({ error: "Backend not configured" }, 500);
    let upstream: Response;
    try {
      upstream = await backendFetch(env, "/api/config", { signal: AbortSignal.timeout(5_000) });
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

// ── Index Routing (maintenance / countdown / home) ────────────────────────

interface SiteConfig {
  maintenanceMode: boolean;
  comingSoonUntil: number | null;
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
  const dev = isLocalDev(request);

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
    if (view === "login") {
      return env.ASSETS.fetch(new Request(new URL("/login/", request.url).toString()));
    }
  }

  if (!env.BACKEND && !env.LEAPIFY_API_URL) return null;

  let config: SiteConfig | null = null;

  try {
    const configRes = await backendFetch(env, "/api/config", { signal: AbortSignal.timeout(3_000) });

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
    console.warn("[worker] Config fetch failed, trying cached config:", err);
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

  if (config.maintenanceMode && !dev) {
    return env.ASSETS.fetch(new Request(new URL("/maintenance/", request.url).toString()));
  }

  if (config.comingSoonUntil && config.comingSoonUntil * 1000 > now && !dev) {
    return env.ASSETS.fetch(new Request(new URL("/countdown/", request.url).toString()));
  }

  // Check if the user has an active Better Auth session
  const cookie = request.headers.get("Cookie") ?? "";
  const hasSession = /(?:^|;\s*)(?:__secure-)?better-auth\.session_token=/.test(cookie);

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

      // Fallback: proxy all other HTTP /api/* requests (e.g. /api/auth/* for Google OAuth)
      // dynamically to the backend console worker.
      try {
        return await backendFetch(env, pathname + url.search, {
          method: request.method,
          headers: request.headers,
          body: request.method !== "GET" && request.method !== "HEAD" ? await request.clone().blob() : undefined,
          redirect: "manual", // Crucial: lets the browser follow OAuth 302 redirects instead of following them internally
        });
      } catch (err) {
        console.error("[worker] Failed to proxy API request:", err);
        return jsonResponse({ error: "Upstream gateway error" }, 502);
      }
    }

    // /countdown, /maintenance, and /login are only served via worker routing at /.
    // Redirect browser navigations (Accept: text/html) so they can't be bookmarked/scraped.
    // Server-side fetches (e.g. astro build prerender) don't include text/html in Accept,
    // so they fall through and get the actual HTML — keeping astro build working with one config.
    if (
      request.method === "GET" &&
      (pathname.startsWith("/countdown") || pathname.startsWith("/maintenance") || pathname.startsWith("/login")) &&
      (request.headers.get("Accept") ?? "").includes("text/html")
    ) {
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // For browser navigations to /, check config and serve the right page
    if (
      request.method === "GET" &&
      (pathname === "/" || pathname === "") &&
      (request.headers.get("Accept") ?? "").includes("text/html")
    ) {
      const routed = await routeIndex(request, env);
      if (routed) return routed;
    }

    if (!env.ASSETS) return jsonResponse({ error: "Not found" }, 404);
    const assetRes = await env.ASSETS.fetch(request);

    // Stamp _dev=1 cookie on HTML pages when running in local dev.
    // Client-side bypass bar reads this cookie to decide whether to show.
    const devActive = isLocalDev(request);
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
