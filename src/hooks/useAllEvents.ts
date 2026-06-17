import { useState, useEffect } from 'react';
import { subscribeToEvents, getEventsSnapshot } from '../services/leapify';
import type { LeapEvent } from '../services/leapify';

export function useAllEvents(): readonly LeapEvent[] {
  const [events, setEvents] = useState<readonly LeapEvent[]>(getEventsSnapshot);
  useEffect(() => subscribeToEvents(setEvents), []);
  return events;
}
