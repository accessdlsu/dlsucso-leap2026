// ── Turnstile ─────────────────────────────────────────────────────────────────

const SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

let turnstileSolved = false;
let turnstilePromise: Promise<boolean> | null = null;
let turnstileToken: string | null = null;
let turnstileErrorCallback: ((message: string) => void) | null = null;

export function onTurnstileError(callback: (message: string) => void): void {
  turnstileErrorCallback = callback;
}

/** No-op kept for backward compat — container is now looked up by ID at render time. */
export function signalTurnstileContainer(_el: HTMLElement): void {}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        opts: { sitekey: string; appearance?: string; callback: (token: string) => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.turnstile !== "undefined") { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });
}

async function executeTurnstile(siteKey: string): Promise<string | null> {
  const container = document.getElementById("turnstile-widget");
  if (!container) return null;
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; try { window.turnstile.remove(widgetId); } catch {} resolve(null); }
    }, 14_000);
    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      appearance: "interaction-only",
      callback: (token: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { window.turnstile.remove(widgetId); } catch {}
        resolve(token);
      },
    });
  });
}

async function solveTurnstileChallenge(): Promise<boolean> {
  if (turnstileSolved) return true;
  if (turnstilePromise) return turnstilePromise;
  turnstilePromise = (async () => {
    if (!SITE_KEY) return false;
    try {
      await loadTurnstileScript();
      const token = await executeTurnstile(SITE_KEY);
      if (token) {
        turnstileToken = token;
        turnstileSolved = true;
        return true;
      }
      return false;
    } catch (error) {
      console.warn("[leapify] Turnstile unavailable (blocked?):", error);
      return false;
    } finally {
      turnstilePromise = null;
    }
  })();
  return turnstilePromise;
}

// ── API Types ─────────────────────────────────────────────────────────────────

export interface SiteConfig {
  comingSoonUntil: number | null;
  siteEndsAt: number | null;
  siteName: string | null;
  registrationGloballyOpen: boolean;
  maintenanceMode: boolean;
  allowedOrigins: string[];
  now: number;
}

export interface LeapEventOrg {
  id: string;
  name: string;
  acronym: string;
  logoUrl: string | null;
  link: string | null;
}

export interface LeapEventTheme {
  id: string;
  name: string;
  path: string;
  imageUrl: string | null;
  descriptionEn: string | null;
  sortOrder: number;
}

export interface LeapEvent {
  id: string;
  slug: string;
  themeId: string;
  organizationId: string;
  title: string;
  description: string;
  venue: string;
  price: string;
  backgroundImageUrl: string | null;
  classCode: string;
  startTime: string;
  endTime: string;
  registrationClosesAt: number;
  isSpotlight: boolean;
  maxSlots: number;
  gformsUrl: string | null;
  theme: LeapEventTheme;
  organization: LeapEventOrg;
  date: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface SlotInfo {
  eventId: string;
  maxSlots: number;
  registeredSlots: number;
  availableSlots: number;
}

export interface Theme {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Organization {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  [key: string]: unknown;
}

export interface BookmarkEntry {
  userId: string;
  eventId: string;
  [key: string]: unknown;
}

export interface ToggleBookmarkResult {
  bookmarked: boolean;
}

export interface HealthResponse {
  status: string;
  project: string;
  timestamp: string;
}

// ── WebSocket Protocol ────────────────────────────────────────────────────────

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

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const WS_REQUEST_TIMEOUT_MS = 30_000;

// ── WebSocket Client ──────────────────────────────────────────────────────────

class WsApiClient {
  private ws: WebSocket | null = null;
  private pending: Map<string, PendingRequest> = new Map();
  private connecting: Promise<void> | null = null;
  private authToken: string | null = null;
  private getCache = new Map<string, unknown>();
  private static CACHED_GET_PATHS = new Set(["/faqs"]);

  setToken(token: string | null): void {
    this.authToken = token;
  }

  private async ensureConnected(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;

    // eslint-disable-next-line no-async-promise-executor
    this.connecting = new Promise<void>(async (resolve, reject) => {
      if (!turnstileSolved && SITE_KEY) {
        const solved = await solveTurnstileChallenge().catch(() => false);
        if (!solved) {
          console.warn("[leapify] Turnstile failed, proceeding without token");
          turnstileErrorCallback?.("Security verification failed, attempting connection anyway");
        }
      }

      const wsUrl = new URL("/api", window.location.origin);
      wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
      if (turnstileToken) wsUrl.searchParams.set("turnstile_token", turnstileToken);

      try {
        this.ws = new WebSocket(wsUrl.toString());
      } catch (err) {
        console.error("[leapify] WebSocket creation failed:", err);
        this.connecting = null;
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        console.log("[leapify] WebSocket connected");
        this.connecting = null;
        // Turnstile tokens are one-time use — reset so any reconnect gets a fresh token
        turnstileSolved = false;
        turnstileToken = null;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const res: WsApiResponse = JSON.parse(event.data as string);
          const p = this.pending.get(res.id);
          if (!p) return;
          this.pending.delete(res.id);
          clearTimeout(p.timeout);
          if (res.status >= 200 && res.status < 300) {
            const body = res.body as { data?: unknown };
            p.resolve(rewriteUploadUrls(body?.data ?? res.body));
          } else {
            const body = res.body;
            let message: string;
            if (typeof body === "object" && body !== null && "error" in body) {
              const errObj = (body as { error?: { message?: string } }).error;
              const rawMsg = errObj?.message ?? `API error ${res.status}`;
              message = typeof rawMsg === 'string' ? rawMsg.slice(0, 200) : `API error ${res.status}`;
            } else if (typeof body === "string") {
              message = body || `API error ${res.status}`;
            } else {
              message = `API error ${res.status}`;
            }
            p.reject(new Error(message));
          }
        } catch (err) {
          console.error("[leapify] Failed to parse WebSocket message:", err);
        }
      };

      this.ws.onclose = (event) => {
        console.log("[leapify] WebSocket closed:", event.code, event.reason);
        this.ws = null;
        this.connecting = null;
        for (const [id, p] of this.pending) {
          clearTimeout(p.timeout);
          p.reject(new Error("WebSocket connection closed"));
          this.pending.delete(id);
        }
      };

      this.ws.onerror = (event) => {
        console.error("[leapify] WebSocket error:", event);
        this.connecting = null;
        reject(new Error("WebSocket connection failed"));
      };
    });

    return this.connecting;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const cacheKey = `${method}:${path}`;
    if (WsApiClient.CACHED_GET_PATHS.has(path) && this.getCache.has(cacheKey)) {
      return this.getCache.get(cacheKey) as T;
    }

    await this.ensureConnected();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const id = crypto.randomUUID();
    const req: WsApiRequest = {
      id,
      method,
      path,
      token: this.authToken ?? undefined,
      body: body ? JSON.stringify(body) : undefined,
    };

    const result = await new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout: ${method} ${path}`));
      }, WS_REQUEST_TIMEOUT_MS);

      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      this.ws!.send(JSON.stringify(req));
    });

    if (WsApiClient.CACHED_GET_PATHS.has(path)) {
      this.getCache.set(cacheKey, result);
    }

    return result;
  }
}

// ── Upload URL Rewriting ──────────────────────────────────────────────────────

const UPLOADS_PREFIX = "/api/uploads/";
const DATA_PREFIX = "/data/";

function rewriteUploadUrls(value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(UPLOADS_PREFIX)) {
    return DATA_PREFIX + value.slice(UPLOADS_PREFIX.length);
  }
  if (Array.isArray(value)) return value.map(rewriteUploadUrls);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteUploadUrls(v);
    return out;
  }
  return value;
}

// ── Singleton + Public API ────────────────────────────────────────────────────

const wsClient = new WsApiClient();

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export const leapifyApi = {
  setToken: (token: string | null) => wsClient.setToken(token),

  // Public
  getConfig: () => wsClient.request<SiteConfig>("GET", "/config"),
  getEvents: () => wsClient.request<LeapEvent[]>("GET", "/classes"),
  getEvent: (slug: string) =>
    wsClient.request<LeapEvent>("GET", `/classes/${encodeURIComponent(slug)}`),
  getSlots: (slug: string) =>
    wsClient.request<SlotInfo>("GET", `/classes/${encodeURIComponent(slug)}/slots`),
  getThemes: () => wsClient.request<Theme[]>("GET", "/themes"),
  getOrganizations: () => wsClient.request<Organization[]>("GET", "/organizations"),
  getFaqs: () => wsClient.request<Faq[]>("GET", "/faqs"),
  getHealth: () => fetchHealth(),

  // Admin
  checkFormAccess: (slug: string) =>
    wsClient.request<{ hasAccess: boolean; reason?: string }>("GET", `/classes/${encodeURIComponent(slug)}/check-form-access`),

  // Authenticated
  getMe: () =>
    wsClient.request<UserProfile | null>("GET", "/users/me").catch(() => null),
  signOut: () => wsClient.request("POST", "/auth/sign-out"),
  getBookmarks: () =>
    wsClient.request<BookmarkEntry[]>("GET", "/users/me/bookmarks"),
  toggleBookmark: (eventId: string) =>
    wsClient.request<ToggleBookmarkResult>(
      "POST",
      `/users/me/bookmarks/${encodeURIComponent(eventId)}`,
    ),
  deleteBookmark: (eventId: string) =>
    wsClient.request<ToggleBookmarkResult>(
      "DELETE",
      `/users/me/bookmarks/${encodeURIComponent(eventId)}`,
    ),
};
