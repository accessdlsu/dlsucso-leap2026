import { useState, useEffect } from 'react';
import { leapifyApi } from '../services/leapify';
import type { MainEvent, LeapClass } from '../types';

/**
 * Hook to fetch main events from Leapify API
 */
export function useMainEvents(): {
  events: MainEvent[];
  loading: boolean;
  error: string | null;
} {
  const [events, setEvents] = useState<MainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await leapifyApi.getEvents();
        const spotlightEvents = response.filter((item) => item.isSpotlight);
        
        const ACCENT_COLORS = ['#de9a49', '#4ab09a', '#b05a32', '#5ca0a8', '#803e2f'];

        const mapped: MainEvent[] = spotlightEvents.map((item, i) => {
          const img = item.backgroundImageUrl || 'https://placehold.co/420x260?text=No+Image';

          return {
            id: item.id,
            title: item.title || 'Untitled Event',
            description: item.description || '',
            img,
            tag: item.theme?.name || 'LEAP 2026',
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            date: item.dateTime || '',
            time: item.startTime && item.endTime ? `${item.startTime} – ${item.endTime}` : item.startTime || '',
            venue: item.venue || '',
            capacity: item.maxSlots || 0,
          };
        });

        setEvents(mapped);
      } catch (err) {
        console.error('Error fetching main events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}

/**
 * Hook to filter and sort leap classes
 */
export function useFilteredClasses(
  classes: LeapClass[],
  searchQuery: string,
  sortBy: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc'
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
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'slots-asc':
          return a.slots - b.slots;
        case 'slots-desc':
          return b.slots - a.slots;
        default:
          return 0;
      }
    });
}

/**
 * Hook to get unique days from classes
 */
export function useUniqueDays(classes: LeapClass[]): string[] {
  return Array.from(new Set(classes.map((c) => c.date))).sort();
}
