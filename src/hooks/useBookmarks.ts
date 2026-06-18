import { useState, useEffect, useCallback } from 'react';
import { leapifyApi } from '../services/leapify';
import { getCachedProfile } from '../services/auth';

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => getCachedProfile() !== null);

  useEffect(() => {
    const check = () => setIsLoggedIn(getCachedProfile() !== null);
    window.addEventListener('storage', check);
    window.addEventListener('leapify-auth-change', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('leapify-auth-change', check);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    leapifyApi.getBookmarks().then(bms => {
      setBookmarkedIds(new Set(bms.map(b => b.event.id)));
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleBookmarkToggle = useCallback(async (eventId: string) => {
    if (!isLoggedIn || bookmarkPending) return;
    const wasBookmarked = bookmarkedIds.has(eventId);
    setBookmarkedIds(prev => {
      const n = new Set(prev);
      wasBookmarked ? n.delete(eventId) : n.add(eventId);
      return n;
    });
    setBookmarkPending(eventId);
    try {
      const result = await leapifyApi.toggleBookmark(eventId);
      setBookmarkedIds(prev => {
        const n = new Set(prev);
        result.bookmarked ? n.add(eventId) : n.delete(eventId);
        return n;
      });
    } catch (err) {
      console.error('[useBookmarks] Failed to toggle bookmark:', err);
      setBookmarkedIds(prev => {
        const n = new Set(prev);
        wasBookmarked ? n.add(eventId) : n.delete(eventId);
        return n;
      });
    } finally {
      setBookmarkPending(null);
    }
  }, [isLoggedIn, bookmarkedIds, bookmarkPending]);

  return { bookmarkedIds, bookmarkPending, handleBookmarkToggle, isLoggedIn };
}
