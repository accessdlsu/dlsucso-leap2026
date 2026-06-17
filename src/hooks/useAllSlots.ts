import { useState, useEffect } from 'react';
import { subscribeToSlots, getSlotsSnapshot } from '../services/leapify';
import type { SlotInfo } from '../services/leapify';

/**
 * Returns a shared, site-wide slug→SlotInfo map.
 * One poll loop drives all subscribers — components always show consistent data.
 */
export function useAllSlots(): ReadonlyMap<string, SlotInfo> {
  const [slots, setSlots] = useState<ReadonlyMap<string, SlotInfo>>(getSlotsSnapshot);
  useEffect(() => subscribeToSlots(setSlots), []);
  return slots;
}
