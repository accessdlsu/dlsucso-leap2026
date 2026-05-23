const API_URL = (import.meta.env.VITE_LEAPIFY_API_URL || "").replace(/\/$/, "");
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
const TURNSTILE_VERIFY_PATH = "/.well-known/leapify/turnstile/verify";

let turnstileSolved = false;
let turnstilePromise: Promise<boolean> | null = null;

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

      const res = await fetch(`${API_URL}${TURNSTILE_VERIFY_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      if (res.ok) {
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
  status?: EventStatus;
  createdAt?: number;
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  image: string | null;
  createdAt: number;
}

export interface LeapFaq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface SiteConfig {
  comingSoonUntil: number | null;
  siteEndsAt: number | null;
  siteName: string | null;
  registrationGloballyOpen: boolean;
  maintenanceMode: boolean;
  now: number;
}

let authToken: string | null = null;

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = async () => {
    const headers = new Headers(options.headers || {});
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    const fullUrl = `${API_URL}${path}`;
    console.log(`[leapify] Request: ${options.method || "GET"} ${fullUrl}`);

    const res = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });

    const ct = res.headers.get("content-type") || "";
    if (res.status === 401 || ct.includes("text/html")) {
      const data = await res.clone().json().catch(() => null);
      if (data?.error?.code === "TURNSTILE_REQUIRED" || ct.includes("text/html")) {
        return { turnstileRequired: true, response: res };
      }
    }

    return { json: await res.json() };
  };

  let result = await makeRequest();

  if (result.turnstileRequired) {
    console.warn(`[leapify] Turnstile cookie missing or expired for ${path}, solving challenge...`);
    turnstileSolved = false;
    const solved = await solveTurnstileChallenge();
    if (solved) {
      result = await makeRequest();
    }
  }

  if (result.turnstileRequired) {
    console.error(`[leapify] Expected JSON but got Turnstile required or error page from ${path} after retry.`);
    throw new Error("API requires Turnstile verification");
  }

  const json = result.json;
  const data = json.data ?? json;
  console.log(`[leapify] Response from ${path}:`, data);
  return data;
}

export const leapifyApi = {
  setToken: (token: string | null) => {
    authToken = token;
  },
  getEvents: () => api<LeapEvent[]>("/api/classes"),
  getFaqs: () => api<LeapFaq[]>("/api/faqs"),
  getConfig: () => api<SiteConfig>("/api/config"),
  getHealth: () => api<{ status: string }>("/health"),
  getMe: () => api<UserProfile | null>("/api/users/me").catch(() => null),
  signOut: () => api("/api/auth/sign-out", { method: "POST" }),
};
