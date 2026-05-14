/**
 * DLSU CSO LEAP 2026 — Cloudflare Worker Entry Point
 *
 * This file runs at the edge (Cloudflare's global network) and:
 *  1. Injects security & performance HTTP headers on every response
 *  2. Serves the Vite-built static site via Cloudflare Pages assets
 *  3. Exposes a lightweight `/api/health` endpoint for uptime checks
 *  4. Optionally proxies Contentful requests to avoid exposing the
 *     access token in the browser bundle (opt-in via env var)
 *
 * Deployment targets
 * ──────────────────
 *   Cloudflare Pages  →  `npm run deploy`        (preferred)
 *   Standalone Worker →  `npm run worker:deploy`  (advanced)
 *
 * Local development
 * ─────────────────
 *   `npm run pages:dev`   — Pages + Worker with hot-reload
 *   `npm run worker:dev`  — standalone Worker dev server
 */

export interface Env {
  /** Set via `wrangler secret put` or `.dev.vars` for local dev */
  VITE_CONTENTFUL_SPACE_ID?: string;
  VITE_CONTENTFUL_ACCESS_TOKEN?: string;
  VITE_FIREBASE_API_KEY?: string;

  /** Injected by wrangler.jsonc `vars` */
  ENVIRONMENT?: string;

  /**
   * Cloudflare Pages automatically binds this when
   * `pages_build_output_dir` is set in wrangler.jsonc.
   */
  STATIC_ASSETS: Fetcher;
}

// ── Security & Cache Headers ──────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",
  // Disallow iframing (clickjacking)
  "X-Frame-Options": "DENY",
  // Force HTTPS for 1 year (including sub-domains)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Tight referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Basic permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  /**
   * Content-Security-Policy
   * Adjusted for Firebase Auth popup + Contentful CDN + Google Fonts.
   * Tighten further before going to production if you add/remove origins.
   */
  "Content-Security-Policy": [
    "default-src 'self'",
    // Firebase SDK + Google Auth popup
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    // Firebase, Contentful image CDN, Google Fonts, placehold.co
    "img-src 'self' data: https: blob:",
    // Firebase Firestore & Storage WebSocket
    "connect-src 'self' http://localhost:8787 http://127.0.0.1:8787 https://*.googleapis.com https://*.firebaseio.com https://*.contentful.com https://cdn.contentful.com wss://*.firebaseio.com https://leapify-console.accessdlsu.workers.dev",
    // Google Fonts + self
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Firebase Auth popup
    "frame-src https://accounts.google.com https://*.firebaseapp.com",
  ].join("; "),
};

/** Cache control for static assets (1 year, immutable) */
const ASSET_CACHE = "public, max-age=31536000, immutable";
/** Cache control for HTML documents (no-cache so updates propagate instantly) */
const HTML_CACHE = "public, max-age=0, must-revalidate";

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyHeaders(
  response: Response,
  extra?: Record<string, string>,
): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      ...SECURITY_HEADERS,
    },
  });
}

// ── API Routes ────────────────────────────────────────────────────────────────

async function handleApiRequest(
  request: Request,
  env: Env,
  pathname: string,
): Promise<Response | null> {
  // GET /api/health — uptime / smoke-test endpoint
  if (pathname === "/api/health" && request.method === "GET") {
    return jsonResponse({
      status: "ok",
      project: "dlsucso-leap2026",
      environment: env.ENVIRONMENT ?? "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/contentful — server-side Contentful proxy
   *
   * Keeps the Contentful access token out of the browser bundle.
   * Usage: GET /api/contentful?content_type=mainEvents&include=2&limit=5
   *
   * Only active when VITE_CONTENTFUL_SPACE_ID and
   * VITE_CONTENTFUL_ACCESS_TOKEN are bound as Worker secrets.
   */
  if (pathname === "/api/contentful" && request.method === "GET") {
    const spaceId = env.VITE_CONTENTFUL_SPACE_ID;
    const token = env.VITE_CONTENTFUL_ACCESS_TOKEN;

    if (!spaceId || !token) {
      return jsonResponse(
        { error: "Contentful credentials not configured on the edge." },
        503,
      );
    }

    const url = new URL(request.url);
    const params = new URLSearchParams(url.searchParams);
    params.set("access_token", token);

    const contentfulUrl = `https://cdn.contentful.com/spaces/${spaceId}/entries?${params.toString()}`;

    try {
      const upstream = await fetch(contentfulUrl, {
        headers: { Accept: "application/json" },
      });

      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          // Cache Contentful responses at the edge for 60 s
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
          ...SECURITY_HEADERS,
        },
      });
    } catch (err) {
      console.error("[worker] Contentful proxy error:", err);
      return jsonResponse({ error: "Failed to reach Contentful CDN." }, 502);
    }
  }

  // No matching API route
  return null;
}

// ── Main Fetch Handler ────────────────────────────────────────────────────────

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // ── 1. API routes ──────────────────────────────────────────────────────
    if (pathname.startsWith("/api/")) {
      const apiResponse = await handleApiRequest(request, env, pathname);
      if (apiResponse) return apiResponse;

      return jsonResponse({ error: "Not found" }, 404);
    }

    // ── 2. Static assets (Vite build output via Pages STATIC_ASSETS binding) ──────
    try {
      const assetResponse = await env.STATIC_ASSETS.fetch(request);

      // Determine cache lifetime by content type
      const contentType = assetResponse.headers.get("Content-Type") ?? "";
      const isHtml = contentType.includes("text/html");

      return applyHeaders(assetResponse, {
        "Cache-Control": isHtml ? HTML_CACHE : ASSET_CACHE,
      });
    } catch {
      // Fallback: serve index.html for SPA client-side routing
      try {
        const indexRequest = new Request(
          new URL("/index.html", request.url).toString(),
          request,
        );
        const fallback = await env.STATIC_ASSETS.fetch(indexRequest);
        return applyHeaders(fallback, { "Cache-Control": HTML_CACHE });
      } catch {
        return new Response("Service unavailable", { status: 503 });
      }
    }
  },
} satisfies ExportedHandler<Env>;
