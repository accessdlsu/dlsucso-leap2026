import { useState, useEffect } from 'react';
import { contentfulClient } from '../services/contentful';
import type { MainEvent, LeapClass } from '../types';

/**
 * Hook to fetch main events from Contentful
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
      if (!contentfulClient) {
        setLoading(false);
        return;
      }

      try {
        const response = await contentfulClient.getEntries({
          content_type: 'mainEvents',
          include: 2,
          order: ['fields.mainEventStartDate'] as any,
        });

        const ACCENT_COLORS = ['#de9a49', '#4ab09a', '#b05a32', '#5ca0a8', '#803e2f'];

        const mapped: MainEvent[] = response.items.map((item: any, i: number) => {
          const pubMat = item.fields.mainEventPosterPublishingMaterial;
          const mediaAsset = Array.isArray(pubMat) ? pubMat[0] : pubMat;
          const img = mediaAsset?.fields?.file?.url
            ? mediaAsset.fields.file.url.startsWith('http')
              ? mediaAsset.fields.file.url
              : `https:${mediaAsset.fields.file.url}`
            : 'https://placehold.co/420x260?text=No+Image';

          return {
            id: item.sys.id,
            title: item.fields.mainEventTitle || 'Untitled Event',
            description: item.fields.mainEventDescription || '',
            img,
            tag: item.fields.mainEventTag || 'LEAP 2026',
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            date: item.fields.mainEventStartDate || '',
            time: item.fields.mainEventStartTime || '',
            venue: item.fields.mainEventVenue || '',
            capacity: item.fields.mainEventCapacity || 0,
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
