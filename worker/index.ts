/**
 * DLSU CSO LEAP 2026 — Cloudflare Worker Entry Point
 *
 * This file runs at the edge (Cloudflare's global network) and:
 *  1. Injects security & performance HTTP headers on every response
 *  2. Serves the Vite-built static site via Cloudflare Pages assets
 *  3. Exposes a WebSocket API proxy at `/api` for anti-scraping
 *  4. Exposes a lightweight `/api/health` endpoint for uptime checks
 *
 * Anti-scraping: Browser communicates with the backend exclusively via
 * WebSocket. API endpoints are not visible in Chrome DevTools Network tab,
 * making simple curl-based scraping ineffective.
 */
export interface Env {
  /** Set via `wrangler secret put` or `.dev.vars` for local dev */
  CONTENTFUL_SPACE_ID?: string;
  CONTENTFUL_ACCESS_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Injected by wrangler.jsonc `vars` */
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  VITE_TURNSTILE_SITE_KEY?: string;
  VITE_LEAPIFY_API_URL?: string;
  VITE_ENVIRONMENT?: string;
  /** Service binding to backend Worker (leapify-console) */
  BACKEND?: Fetcher;
  /** Static Assets binding */
  ASSETS?: Fetcher;
}

// ── Security & Cache Headers ──────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  /**
   * Content Security Policy — tuned for this SPA.
   *
   * Tighten further before going to production if you add/remove origins.
   */
  "Content-Security-Policy": [
    "default-src 'self'",
    // Firebase SDK + Google Auth popup + unsafe-inline
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    // Firebase, Contentful image CDN, Google Fonts, placeholder.com
    "img-src 'self' data: https: blob:",
    // Firebase Firestore & Storage + Google APIs + Contentful CDN
    "connect-src 'self' http://localhost:8787 http://127.0.0.1:8787 https://*.googleapis.com https://*.firebaseio.com https://*.contentful.com https://cdn.contentful.com wss://*.firebaseio.com",
    // Google Fonts + self
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Firebase Auth popup
    "frame-src https://accounts.google.com https://*.firebaseapp.com",
  ].join("; "),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      ...SECURITY_HEADERS,
    },
  });
}

// ── WebSocket API Proxy ───────────────────────────────────────────────────────

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

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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

function safeWsSend(server: WebSocket, data: string): void {
  try {
    if (server.readyState === 1) {
      server.send(data);
    }
  } catch {
    // WebSocket already closed — nothing we can do.
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
    const backendUrl = env.VITE_LEAPIFY_API_URL;
    if (!backendUrl && !env.BACKEND) {
      safeWsSend(server, JSON.stringify({
        id: req.id,
        status: 500,
        body: { error: { code: "CONFIG_ERROR", message: "Backend URL not configured" } },
      } satisfies WsApiResponse));
      return;
    }

    const headers: Record<string, string> = {
      "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
    };
    if (req.token) {
      headers["Authorization"] = `Bearer ${req.token}`;
    }
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

    const targetUrl = `${backendUrl}/api${req.path}`;
    console.log(`[worker] WS proxy: ${req.method} ${req.path}`);

    // Use service binding for direct Worker-to-Worker communication when
    // available. Regular fetch() to *.workers.dev URLs fails when both
    // Workers are deployed on Cloudflare (works only in local dev).
    let upstream: Response;
    if (env.BACKEND) {
      upstream = await env.BACKEND.fetch(new Request(targetUrl, fetchInit));
    } else {
      upstream = await fetch(targetUrl, fetchInit);
    }
    const contentType = upstream.headers.get("content-type") || "";

    let body: unknown;
    if (contentType.includes("application/json")) {
      body = await upstream.json();
    } else {
      const text = await upstream.text();
      // Detect Cloudflare error pages (e.g. "error code: 1042") and wrap
      // them in a structured JSON envelope so the client can display them.
      if (text.startsWith("error code:") || text.includes("CF error")) {
        body = { error: { code: "UPSTREAM_ERROR", message: text.trim() } };
      } else {
        body = text;
      }
    }

    safeWsSend(server, JSON.stringify({
      id: req.id,
      status: upstream.status,
      body,
    } satisfies WsApiResponse));
  } catch (err) {
    safeWsSend(server, JSON.stringify({
      id: reqId,
      status: 502,
      body: { error: { code: "PROXY_ERROR", message: err instanceof Error ? err.message : "Failed to proxy request" } },
    } satisfies WsApiResponse));
    console.error("[worker] WebSocket proxy error:", err);
  }
}

function handleWebSocketUpgrade(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Response {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  server.accept();

  // Validate Turnstile asynchronously after accepting the WebSocket.
  // If validation fails, close the socket. This keeps the upgrade handler
  // synchronous so the fetch handler returns 101 immediately.
  if (env.TURNSTILE_SECRET_KEY) {
    const url = new URL(request.url);
    const turnstileToken = url.searchParams.get("turnstile_token");
    if (!turnstileToken) {
      server.close(1008, "Turnstile token required");
      return new Response(null, { status: 101, webSocket: client });
    }
    const ip = request.headers.get("CF-Connecting-IP");
    ctx.waitUntil(
      verifyTurnstileToken(env.TURNSTILE_SECRET_KEY, turnstileToken, ip).then((valid) => {
        if (!valid) {
          console.warn("[worker] Turnstile validation failed, closing WebSocket");
          try { server.close(1008, "Turnstile verification failed"); } catch { /* already closed */ }
        }
      }).catch((err) => {
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
  });

  server.addEventListener("error", (event) => {
    console.error("[worker] WebSocket error:", event);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// ── API Routes ────────────────────────────────────────────────────────────────

async function handleApiRequest(
  request: Request,
  env: Env,
  pathname: string,
  ctx: ExecutionContext,
): Promise<Response | null> {
  // GET /api/health — uptime / smoke-test endpoint
  if (pathname === "/api/health" && request.method === "GET") {
    return jsonResponse({
      status: "ok",
      project: "dlsucso-leap2026",
      environment: env.VITE_ENVIRONMENT ?? "unknown",
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

  // No matching API route
  return null;
}

// ── Main Fetch Handler ────────────────────────────────────────────────────────

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // ── 1. API routes ──────────────────────────────────────────────────────
    if (pathname.startsWith("/api")) {
      const apiResponse = await handleApiRequest(request, env, pathname, ctx);
      if (apiResponse) return apiResponse;

      return jsonResponse({ error: "Not found" }, 404);
    }

    // ── 2. All other routes handled by static assets ────────────────
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
