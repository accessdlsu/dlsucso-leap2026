import { useState, useEffect, useCallback } from "react";
import { leapifyApi } from "../services/leapify";
import type {
  LeapEvent,
  Theme,
  Organization,
  Faq,
  SiteConfig,
  SlotInfo,
  BookmarkEntry,
  HealthResponse,
} from "../services/leapify";
import type { MainEvent, LeapClass } from "../types";
import { toMainEvent, toLeapClass } from "../utils/event-mappers";

// ─── Reusable fetch-state shape ──────────────────────────────────────────────

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function initialFetchState<T>(fallback: T): FetchState<T> {
  return { data: fallback, loading: true, error: null };
}

// ─── useEvents — all published events ────────────────────────────────────────

export function useEvents(): FetchState<LeapEvent[]> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<LeapEvent[]>>(
    initialFetchState([]),
  );
  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await leapifyApi.getEvents();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch events",
      }));
    }
  }, []);
  useEffect(() => {
    void fetch();
  }, [fetch]);
  return { ...state, refetch: fetch };
}

// ─── useMainEvents — spotlight events mapped to MainEvent ────────────────────

export function useMainEvents(): FetchState<MainEvent[]> {
  const [state, setState] = useState<FetchState<MainEvent[]>>(
    initialFetchState([]),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const events = await leapifyApi.getEvents();
        if (cancelled) return;
        const spotlightEvents = events.filter((e) => e.isSpotlight);
        setState({
          data: spotlightEvents.map((e, i) => toMainEvent(e, i)),
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to fetch events",
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── useClasses — non-spotlight events mapped to LeapClass ───────────────────

export function useClasses(): FetchState<LeapClass[]> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<LeapClass[]>>(
    initialFetchState([]),
  );
  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const events = await leapifyApi.getEvents();
      const classes = events.map((e) => toLeapClass(e));
      setState({ data: classes, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch classes",
      }));
    }
  }, []);
  useEffect(() => {
    void fetch();
  }, [fetch]);
  return { ...state, refetch: fetch };
}

// ─── useEvent — single event by slug ─────────────────────────────────────────

export function useEvent(
  slug: string,
): FetchState<LeapEvent | null> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<LeapEvent | null>>(
    initialFetchState(null),
  );
  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await leapifyApi.getEvent(slug);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch event",
      }));
    }
  }, [slug]);
  useEffect(() => {
    void fetch();
  }, [fetch]);
  return { ...state, refetch: fetch };
}

// ─── useSlots — real-time slot availability with polling ─────────────────────

export function useSlots(
  slug: string,
  pollIntervalMs = 10_000,
): FetchState<SlotInfo | null> {
  const [state, setState] = useState<FetchState<SlotInfo | null>>(
    initialFetchState(null),
  );
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    const fetch = async () => {
      try {
        const data = await leapifyApi.getSlots(slug);
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error ? err.message : "Failed to fetch slots",
          }));
      }
    };
    void fetch();
    timer = setInterval(fetch, pollIntervalMs);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [slug, pollIntervalMs]);
  return state;
}

// ─── useThemes ───────────────────────────────────────────────────────────────

export function useThemes(): FetchState<Theme[]> {
  const [state, setState] = useState<FetchState<Theme[]>>(
    initialFetchState([]),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leapifyApi.getThemes();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error ? err.message : "Failed to fetch themes",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── useOrganizations ────────────────────────────────────────────────────────

export function useOrganizations(): FetchState<Organization[]> {
  const [state, setState] = useState<FetchState<Organization[]>>(
    initialFetchState([]),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leapifyApi.getOrganizations();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : "Failed to fetch organizations",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── useFaqs ─────────────────────────────────────────────────────────────────

export function useFaqs(): FetchState<Faq[]> {
  const [state, setState] = useState<FetchState<Faq[]>>(
    initialFetchState([]),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leapifyApi.getFaqs();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error ? err.message : "Failed to fetch FAQs",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── useConfig ───────────────────────────────────────────────────────────────

export function useConfig(): FetchState<SiteConfig | null> {
  const [state, setState] = useState<FetchState<SiteConfig | null>>(
    initialFetchState(null),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leapifyApi.getConfig();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error ? err.message : "Failed to fetch config",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── useBookmarks (functional after Better Auth migration) ───────────────────

export function useBookmarks(): FetchState<BookmarkEntry[]> & {
  toggle: (eventId: string) => Promise<boolean>;
  remove: (eventId: string) => Promise<void>;
  refetch: () => void;
} {
  const [state, setState] = useState<FetchState<BookmarkEntry[]>>(
    initialFetchState([]),
  );
  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await leapifyApi.getBookmarks();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch bookmarks",
      }));
    }
  }, []);
  useEffect(() => {
    void fetch();
  }, [fetch]);
  const toggle = useCallback(
    async (eventId: string) => {
      const result = await leapifyApi.toggleBookmark(eventId);
      await fetch();
      return result.bookmarked;
    },
    [fetch],
  );
  const remove = useCallback(
    async (eventId: string) => {
      await leapifyApi.deleteBookmark(eventId);
      await fetch();
    },
    [fetch],
  );
  return { ...state, toggle, remove, refetch: fetch };
}

// ─── useHealth ───────────────────────────────────────────────────────────────

export function useHealth(): FetchState<HealthResponse | null> {
  const [state, setState] = useState<FetchState<HealthResponse | null>>(
    initialFetchState(null),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leapifyApi.getHealth();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error ? err.message : "Failed to fetch health",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// ─── Utilities (kept from original) ──────────────────────────────────────────

export function useFilteredClasses(
  classes: LeapClass[],
  searchQuery: string,
  sortBy: "title-asc" | "title-desc" | "slots-desc" | "slots-asc",
): LeapClass[] {
  return classes
    .filter((c) => {
      const query = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.org.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "slots-asc":
          return a.slots - b.slots;
        case "slots-desc":
          return b.slots - a.slots;
        default:
          return 0;
      }
    });
}

export function useUniqueDays(classes: LeapClass[]): string[] {
  return Array.from(new Set(classes.map((c) => c.date))).sort();
}
