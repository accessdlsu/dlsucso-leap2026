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

const TURNSTILE_VERIFY_PATH = "/.well-known/leapify/turnstile/verify";
const API_URL = import.meta.env.VITE_LEAPIFY_API_URL?.replace(/\/$/, "") || "";
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

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

    return res.ok;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

async function fetchWithTurnstile(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  options.credentials = options.credentials || "include";

  let response = await fetch(url, options);

  if (response.status === 401) {
    const data = await response.clone().json().catch(() => null);
    if (data?.error?.code === "TURNSTILE_REQUIRED") {
      console.log("Turnstile cookie missing/expired, solving challenge...");
      const solved = await solveTurnstileChallenge();
      if (solved) {
        response = await fetch(url, options);
      }
    }
  }

  return response;
}

export interface LeapifyEvent {
  id: string;
  slug: string;
  themeId: string | null;
  organizationId: string | null;
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
  publishedAt: number | null;
  theme?: {
    id: string;
    name: string;
  } | null;
  organization?: {
    id: string;
    name: string;
    acronym: string;
    logoUrl: string | null;
  } | null;
}

export const leapifyApi = {
  getEvents: async (): Promise<LeapifyEvent[]> => {
    try {
      const response = await fetchWithTurnstile("/api/classes");
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching events from Leapify API:", error);
      return [];
    }
  },
  
  getSlots: async (slug: string): Promise<{ available: number; total: number; registered: number; isFull: boolean } | null> => {
    try {
      const response = await fetchWithTurnstile(`/api/classes/${slug}/slots`);
      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.statusText}`);
      }
      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching slots for ${slug}:`, error);
      return null;
    }
  }
};
