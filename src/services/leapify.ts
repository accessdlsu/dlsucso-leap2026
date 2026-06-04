const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
let turnstileSolved = false;
let turnstilePromise: Promise<boolean> | null = null;
let turnstileToken: string | null = null;

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void },
      ) => void;
    };
  }
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.turnstile !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });
}

function executeTurnstile(siteKey: string): Promise<string> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.id = "leapify-turnstile-container";
    container.style.display = "none";
    document.body.appendChild(container);
    window.turnstile.render(`#${container.id}`, {
      sitekey: siteKey,
      callback: (token: string) => {
        container.remove();
        resolve(token);
      },
    });
  });
}

export async function solveTurnstileChallenge(): Promise<boolean> {
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
      console.error("Turnstile verification error:", error);
      return false;
    } finally {
      turnstilePromise = null;
    }
  })();
  return turnstilePromise;
}

// ─── Types (backend is source of truth) ──────────────────────────────────────

export type EventStatus =
  | "draft"
  | "queued"
  | "published"
  | "ended"
  | "cancelled";
export type UserRole = "student" | "admin" | "super_admin";
export interface LeapEvent {
  id: string;
  slug: string;
  themeId: string | null;
  theme: {
    id: string;
    name: string;
    path: string;
  } | null;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    acronym: string;
    logoUrl: string | null;
    link: string | null;
  } | null;
  title: string;
  description: string | null;
  venue: string | null;
  dateTime: string | null;
  price: string | null;
  backgroundImageUrl: string | null;
  classCode: string | null;
  startTime: string | null;
  endTime: string | null;
  isSpotlight: boolean;
  maxSlots: number;
  registeredSlots: number;
  gformsUrl: string | null;
  gformsEditorUrl: string | null;
  releaseAt: number | null;
  registrationClosesAt: number | null;
  publishedAt: number | null;
  status: EventStatus;
  createdAt: number;
  updatedAt: number;
}
export interface LeapFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  registeredClasses: string[];
}
export interface SiteConfig {
  comingSoonUntil: number | null;
  siteEndsAt: number | null;
  siteName: string | null;
  registrationGloballyOpen: boolean;
  maintenanceMode: boolean;
  now: number;
}
export interface Theme {
  id: string;
  name: string;
  path: string;
  imageUrl: string | null;
  descriptionEn: string | null;
  descriptionFil: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
export interface Organization {
  id: string;
  name: string;
  acronym: string;
  logoUrl: string | null;
  link: string | null;
  createdAt: number;
}
export interface SlotInfo {
  available: number;
  total: number;
  registered: number;
  isFull: boolean;
}
export interface BookmarkEntry {
  bookmarkedAt: number;
  event: LeapEvent;
}
export interface ToggleBookmarkResult {
  bookmarked: boolean;
}
export interface ServiceHealth {
  configured: boolean;
  ok: boolean;
  latencyMs: number;
  error?: string;
}
export interface HealthResponse {
  status: "OK" | "DEGRADED";
  timestamp: string;
  services: Record<string, ServiceHealth>;
}

// ─── WebSocket API Client ────────────────────────────────────────────────────

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

class WsApiClient {
  private ws: WebSocket | null = null;
  private pending: Map<string, PendingRequest> = new Map();
  private connecting: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;
  private authToken: string | null = null;

  setToken(token: string | null): void {
    this.authToken = token;
  }

  private async ensureConnected(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise<void>(async (resolve, reject) => {
      this.connectResolve = resolve;

      // Solve Turnstile if not already done.
      // If the challenge fails (e.g. test keys on localhost), still attempt
      // connection — the Worker will skip validation when the secret is unset
      // or use the test secret key which always passes.
      if (!turnstileSolved && SITE_KEY) {
        await solveTurnstileChallenge().catch(() => {});
      }

      const wsUrl = new URL("/api", window.location.origin);
      wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
      if (turnstileToken) {
        wsUrl.searchParams.set("turnstile_token", turnstileToken);
      }

      try {
        this.ws = new WebSocket(wsUrl.toString());
      } catch (err) {
        this.connecting = null;
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        console.log("[leapify] WebSocket connected");
        this.connecting = null;
        this.connectResolve?.();
        this.connectResolve = null;
      };

      this.ws.onmessage = (event) => {
        try {
          const res: WsApiResponse = JSON.parse(event.data as string);
          const p = this.pending.get(res.id);
          if (p) {
            this.pending.delete(res.id);
            clearTimeout(p.timeout);
            if (res.status >= 200 && res.status < 300) {
              // Unwrap { data: T } envelope from backend
              const body = res.body as { data?: unknown };
              p.resolve(body?.data ?? res.body);
            } else {
              const body = res.body as { error?: { code?: string; message?: string } };
              const message = body?.error?.message ?? `API error ${res.status}`;
              p.reject(new Error(message));
            }
          }
        } catch (err) {
          console.error("[leapify] Failed to parse WebSocket message:", err);
        }
      };

      this.ws.onclose = (event) => {
        console.log("[leapify] WebSocket closed:", event.code, event.reason);
        this.ws = null;
        this.connecting = null;
        // Reject all pending requests
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

    return new Promise<T>((resolve, reject) => {
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
  }
}

const wsClient = new WsApiClient();

// ─── Health check (direct HTTP, not via WebSocket) ───────────────────────────

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const leapifyApi = {
  setToken: (token: string | null) => {
    wsClient.setToken(token);
  },
  // ─── Public: Events ──────────────────────────────────────────────────────
  getEvents: () => wsClient.request<LeapEvent[]>("GET", "/classes"),
  getEvent: (slug: string) =>
    wsClient.request<LeapEvent>("GET", `/classes/${encodeURIComponent(slug)}`),
  getSlots: (slug: string) =>
    wsClient.request<SlotInfo>("GET", `/classes/${encodeURIComponent(slug)}/slots`),
  // ─── Public: Themes ──────────────────────────────────────────────────────
  getThemes: () => wsClient.request<Theme[]>("GET", "/themes"),
  // ─── Public: Organizations ───────────────────────────────────────────────
  getOrganizations: () => wsClient.request<Organization[]>("GET", "/organizations"),
  // ─── Public: FAQs ────────────────────────────────────────────────────────
  getFaqs: () => wsClient.request<LeapFaq[]>("GET", "/faqs"),
  // ─── Public: Config ──────────────────────────────────────────────────────
  getConfig: () => wsClient.request<SiteConfig>("GET", "/config"),
  // ─── Public: Health ──────────────────────────────────────────────────────
  getHealth: () => fetchHealth(),
  // ─── User (functional after Better Auth migration) ───────────────────────
  getMe: () => wsClient.request<UserProfile | null>("GET", "/users/me").catch(() => null),
  signOut: () => wsClient.request("POST", "/auth/sign-out"),
  getBookmarks: () => wsClient.request<BookmarkEntry[]>("GET", "/users/me/bookmarks"),
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
