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
      void error;
      return false;
    } finally {
      turnstilePromise = null;
    }
  })();
  return turnstilePromise;
}

// ── API Types ─────────────────────────────────────────────────────────────────

export interface AnnouncementContent {
  title: string;
  body: string;
}

export interface Announcement {
  id: string;
  content: Record<string, AnnouncementContent>;
  requiresAck: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SiteConfig {
  comingSoonUntil: number | null;
  siteEndsAt: number | null;
  siteName: string | null;
  registrationGloballyOpen: boolean;
  maintenanceMode: boolean;
  enhancementsMode: boolean;
  enhancementsUntil: number | null;
  allowedOrigins: string[];
  autoCloseRegistration: boolean;
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
  registrationEnabled: boolean;
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
  total: number;
  registered: number;
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
  bookmarkedAt: number;
  event: LeapEvent;
}

export interface ToggleBookmarkResult {
  bookmarked: boolean;
}

export interface MyRegistration {
  slug: string;
  eventId: string;
  submittedAt: number;
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
  private reconnectAttempts = 0;
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
          turnstileErrorCallback?.("Security verification failed, attempting connection anyway");
        }
      }

      const wsUrl = new URL("/api", window.location.origin);
      wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
      if (turnstileToken) wsUrl.searchParams.set("turnstile_token", turnstileToken);

      try {
        this.ws = new WebSocket(wsUrl.toString());
      } catch (err) {
        this.connecting = null;
        reject(err);
        return;
      }

      this.ws.onopen = () => {
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
            p.resolve(rewriteUploadUrls(unwrapResponseBody(res.body)));
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
        }
      };

      this.ws.onclose = (event) => {
        const isIdleClose = event.code === 1000 || event.code === 1001 || event.code === 0;
        const logLevel = isIdleClose ? "debug" : "error";
        console[logLevel](
          `[leapify ws] WebSocket closed (code: ${event.code}, reason: "${event.reason}", idle: ${isIdleClose}, pending: ${this.pending.size})`,
        );
        this.ws = null;
        this.connecting = null;
        for (const [id, p] of this.pending) {
          clearTimeout(p.timeout);
          p.reject(new Error(`WebSocket connection closed (${event.code})`));
          this.pending.delete(id);
        }
        // Auto-reconnect with backoff if there are active subscribers
        if (_eventsSubscribers.size > 0 || _slotsSubscribers.size > 0) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
          this.reconnectAttempts++;
          console.debug(
            `[leapify ws] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}, backoff: ${delay / 1000}s)`,
          );
          setTimeout(() => {
            if (!this.ws && (_eventsSubscribers.size > 0 || _slotsSubscribers.size > 0)) {
              this.ensureConnected().then(() => {
                this.reconnectAttempts = 0;
                console.debug("[leapify ws] Reconnected successfully, resetting backoff counter");
                // Re-fetch data after reconnect
                if (_eventsCache) {
                  _eventsCache = null;
                  fetchEventsOnce().catch(() => {});
                }
                if (_slotsPolling) fetchAllSlots().catch(() => {});
              }).catch(() => {});
            }
          }, delay);
        }
      };

      this.ws.onerror = (event) => {
        console.warn(
          `[leapify ws] WebSocket error during connection (pending: ${this.pending.size})`,
          event,
        );
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

// ── Response Unwrapping ───────────────────────────────────────────────────────

/** Unwrap `{ data: T }` envelope. Returns `body.data` when the key exists (even if null), else `body`. */
export function unwrapResponseBody(body: unknown): unknown {
  if (body !== null && typeof body === 'object' && 'data' in (body as object)) {
    return (body as { data: unknown }).data;
  }
  return body;
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
if (typeof window !== "undefined") {
  try {
    const token = localStorage.getItem("better-auth.session_token");
    if (token) wsClient.setToken(token);
  } catch (e) {}
}

// ── Shared classes store ──────────────────────────────────────────────────────
// Fetch once per session; no poll needed (classes don't change during user session).
type EventsSubscriber = (events: readonly LeapEvent[]) => void;

let _eventsCache: LeapEvent[] | null = null;
let _eventsInflight: Promise<LeapEvent[]> | null = null;
const _eventsSubscribers = new Set<EventsSubscriber>();

async function fetchEventsOnce(): Promise<LeapEvent[]> {
  if (_eventsCache) return _eventsCache;
  if (_eventsInflight) return _eventsInflight;
  _eventsInflight = wsClient.request<LeapEvent[]>("GET", "/classes")
    .then(data => {
      _eventsCache = data ?? [];
      _eventsInflight = null;
      _eventsSubscribers.forEach(fn => fn(_eventsCache!));
      return _eventsCache;
    })
    .catch(err => {
      _eventsInflight = null;
      throw err;
    });
  return _eventsInflight;
}

export function subscribeToEvents(fn: EventsSubscriber): () => void {
  _eventsSubscribers.add(fn);
  if (_eventsCache) {
    fn(_eventsCache);
    // Stale-while-revalidate: emit cached data, then refresh in background
    if (!_eventsInflight) {
      _eventsInflight = wsClient.request<LeapEvent[]>("GET", "/classes")
        .then(data => {
          const fresh = data ?? [];
          _eventsCache = fresh;
          _eventsInflight = null;
          _eventsSubscribers.forEach(fn => fn(fresh));
          return fresh;
        })
        .catch(err => { _eventsInflight = null; throw err; });
    }
  } else {
    fetchEventsOnce().catch(() => {});
  }
  return () => { _eventsSubscribers.delete(fn); };
}

export function getEventsSnapshot(): readonly LeapEvent[] {
  return _eventsCache ?? [];
}

// ── Shared slots store ────────────────────────────────────────────────────────
// Single source of truth for all slot data across every component.
// One poll loop, all subscribers notified on change.
type SlotsSubscriber = (slots: ReadonlyMap<string, SlotInfo>) => void;

const _slotsStore = new Map<string, SlotInfo>(); // slug → SlotInfo
const _slotsSubscribers = new Set<SlotsSubscriber>();
let _slotsPolling = false;
let _slotsInterval: ReturnType<typeof setInterval> | null = null;
let _allSlotsInflight: Promise<Record<string, SlotInfo>> | null = null;

// Legacy per-slug cache kept for getSlots() backwards compat
const _slotCache = new Map<string, { data: SlotInfo; ts: number }>();
const _ALL_SLOTS_TTL = 5_000;

async function fetchAllSlots(): Promise<Record<string, SlotInfo>> {
  if (_allSlotsInflight) return _allSlotsInflight;
  _allSlotsInflight = wsClient
    .request<Record<string, SlotInfo>>("GET", "/classes/slots")
    .then(all => {
      const now = Date.now();
      let changed = false;
      for (const [slug, info] of Object.entries(all)) {
        _slotCache.set(slug, { data: info, ts: now });
        const cur = _slotsStore.get(slug);
        if (!cur || cur.total !== info.total || cur.registered !== info.registered) {
          _slotsStore.set(slug, info);
          changed = true;
        }
      }
      if (changed) {
        const snapshot = new Map(_slotsStore);
        _slotsSubscribers.forEach(fn => fn(snapshot));
      }
      _allSlotsInflight = null;
      return all;
    })
    .catch(err => {
      _allSlotsInflight = null;
      throw err;
    });
  return _allSlotsInflight;
}

function startSlotsPolling() {
  if (_slotsPolling) return;
  _slotsPolling = true;
  fetchAllSlots().catch(() => {});
  _slotsInterval = setInterval(() => fetchAllSlots().catch(() => {}), _ALL_SLOTS_TTL);
}

function stopSlotsPolling() {
  if (_slotsInterval) {
    clearInterval(_slotsInterval);
    _slotsInterval = null;
  }
  _slotsPolling = false;
}

export function subscribeToSlots(fn: SlotsSubscriber): () => void {
  _slotsSubscribers.add(fn);
  startSlotsPolling();
  // Emit current snapshot immediately
  if (_slotsStore.size > 0) fn(new Map(_slotsStore));
  return () => {
    _slotsSubscribers.delete(fn);
    // Stop polling when no subscribers remain
    if (_slotsSubscribers.size === 0) stopSlotsPolling();
  };
}

export function getSlotsSnapshot(): ReadonlyMap<string, SlotInfo> {
  return _slotsStore;
}

async function getSlotsShared(slug: string): Promise<SlotInfo> {
  const hit = _slotCache.get(slug);
  if (hit && Date.now() - hit.ts < _ALL_SLOTS_TTL) return hit.data;
  const all = await fetchAllSlots();
  const info = all[slug];
  if (!info) throw new Error(`No slot data for class: ${slug}`);
  return info;
}

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export const leapifyApi = {
  setToken: (token: string | null) => {
    wsClient.setToken(token);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("leapify-auth-change"));
    }
  },

  // Public
  getConfig: () => wsClient.request<SiteConfig>("GET", "/config"),
  getEvents: () => fetchEventsOnce(),
  getEvent: (slug: string) =>
    wsClient.request<LeapEvent>("GET", `/classes/${encodeURIComponent(slug)}`),
  getSlots: (slug: string) => getSlotsShared(slug),
  getThemes: () => wsClient.request<Theme[]>("GET", "/themes"),
  getOrganizations: () => wsClient.request<Organization[]>("GET", "/organizations"),
  getFaqs: () => wsClient.request<Faq[]>("GET", "/faqs"),
  getAnnouncements: () => wsClient.request<Announcement[]>("GET", "/announcements"),
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
  reconcileSlots: (slug: string) =>
    wsClient.request<SlotInfo>("POST", `/classes/${encodeURIComponent(slug)}/reconcile`),
  getMyRegistration: () =>
    wsClient.request<MyRegistration | null>("GET", "/users/me/registration").catch(() => null),
  getMyRegistrations: () =>
    wsClient.request<MyRegistration[]>("GET", "/users/me/registrations").catch(() => [] as MyRegistration[]),
};
