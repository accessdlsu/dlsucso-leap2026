const API_URL = (import.meta.env.VITE_LEAPIFY_API_URL || "").replace(/\/$/, "");

let powSolved = false;
let powPromise: Promise<void> | null = null;

/**
 * Solve the backend's Proof-of-Work challenge if one is active.
 * Uses a singleton promise to ensure we only solve it once if multiple
 * requests hit at the same time.
 */
async function solvePow(): Promise<void> {
  if (powSolved) return;
  if (powPromise) return powPromise;

  powPromise = (async () => {
    if (!API_URL) return;

    const initialUrl = `${API_URL}/api/classes`;
    console.log("[leapify] PoW check request to:", initialUrl);

    try {
      const res = await fetch(initialUrl, { credentials: "include" });
      const ct = res.headers.get("content-type") || "";
      console.log(`[leapify] PoW check response: ${res.status} ${ct}`);

      if (!ct.includes("text/html")) {
        console.log("[leapify] No PoW challenge detected, proceeding.");
        powSolved = true;
        return;
      }

      const html = await res.text();
      const idMatch = html.match(/challengeId\s*=\s*"([^"]+)"/);
      const diffMatch = html.match(/difficulty\s*=\s*(\d+)/);

      if (!idMatch || !diffMatch) {
        console.warn(
          "[leapify] HTML received but no PoW challenge variables found.",
        );
        return;
      }

      const challengeId = idMatch[1];
      const difficulty = Number(diffMatch[1]);
      const prefix = "0".repeat(Math.ceil(difficulty / 4));
      let nonce = 0;
      const startTime = Date.now();

      console.log(
        `[leapify] Solving PoW: id=${challengeId}, difficulty=${difficulty}, prefix=${prefix}`,
      );

      while (true) {
        const input = new TextEncoder().encode(`${challengeId}:${nonce}`);
        const hash = await crypto.subtle.digest("SHA-256", input);
        const hex = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (hex.startsWith(prefix)) {
          const elapsed = Date.now() - startTime;
          console.log(
            `[leapify] PoW Solved in ${elapsed}ms. nonce=${nonce}. Verifying...`,
          );

          const verifyRes = await fetch(
            `${API_URL}/.well-known/leapify/pow/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: challengeId, nonce, elapsed }),
              credentials: "include",
            },
          );

          if (verifyRes.ok) {
            console.log("[leapify] PoW Verification successful.");
            powSolved = true;
          } else {
            console.error(
              `[leapify] PoW Verification failed: ${verifyRes.status}`,
            );
          }
          return;
        }
        nonce++;
        if (nonce > 1000000) return;
      }
    } catch (err) {
      console.error("[leapify] PoW check failed:", err);
    } finally {
      powPromise = null;
    }
  })();

  return powPromise;
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
  await solvePow();

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
    if (ct.includes("text/html")) {
      return { html: await res.text() };
    }

    return { json: await res.json() };
  };

  let result = await makeRequest();

  // If we got HTML, it might be a stale PoW session. Try solving again and retrying once.
  if (result.html) {
    console.warn(`[leapify] Received HTML from ${path}, retrying PoW...`);
    powSolved = false;
    await solvePow();
    result = await makeRequest();
  }

  if (result.html) {
    console.error(
      `[leapify] Expected JSON but got HTML from ${path} after retry. This usually means the PoW challenge is blocking the request or the server returned an error page.`,
    );
    console.log("[leapify] HTML snippet:", result.html.slice(0, 500));
    throw new Error("API returned HTML instead of JSON");
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
