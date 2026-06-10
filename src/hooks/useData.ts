import { useState, useEffect, useCallback } from "react";
import { leapifyApi } from "../services/leapify";
import type {
  LeapEvent,
  Theme,
  Organization,
  Faq,
  SiteConfig,
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

function createFetchHook<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  errorMessage: string,
) {
  return (): FetchState<T> & { refetch: () => void } => {
    const [state, setState] = useState<FetchState<T>>(initialFetchState(fallback));
    const fetch = useCallback(async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetcher();
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : errorMessage,
        }));
      }
    }, []);
    useEffect(() => {
      void fetch();
    }, [fetch]);
    return { ...state, refetch: fetch };
  };
}

// ─── useEvents — all published events ────────────────────────────────────────
export const useEvents = createFetchHook(
  () => leapifyApi.getEvents(),
  [] as LeapEvent[],
  "Failed to fetch events",
);

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
export const useClasses = createFetchHook(
  async () => {
    const events = await leapifyApi.getEvents();
    return events.map((e) => toLeapClass(e));
  },
  [] as LeapClass[],
  "Failed to fetch classes",
);

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
