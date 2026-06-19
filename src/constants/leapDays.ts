/**
 * LEAP Days 2026 - Single source of truth
 * 
 * These are the official event dates. Only classes falling on these dates
 * will display their "Day x" number. Classes with dates outside this list
 * will NOT show a day number.
 */

export interface LeapDay {
  num: number;
  label: string;
  date: string; // Full format: "Month Day, Year" (e.g., "June 19, 2026")
  weekday: string; // Abbreviated (e.g., "Fri")
  mode: string; // Mode (e.g., "Onsite and Online")
}

export const LEAP_DAYS: LeapDay[] = [
  { num: 1, label: 'Day 1', date: 'June 19, 2026', weekday: 'Fri', mode: 'Onsite and Online' },
  { num: 2, label: 'Day 2', date: 'June 20, 2026', weekday: 'Sat', mode: 'Onsite and Online' },
  { num: 3, label: 'Day 3', date: 'June 22, 2026', weekday: 'Mon', mode: 'Onsite and Online' },
  { num: 4, label: 'Day 4', date: 'June 23, 2026', weekday: 'Tue', mode: 'Onsite and Online' },
  { num: 5, label: 'Day 5', date: 'June 25, 2026', weekday: 'Thu', mode: 'Onsite and Off-Campus' },
  { num: 6, label: 'Day 6', date: 'June 26, 2026', weekday: 'Fri', mode: 'Onsite until 3:00PM' },
];

/**
 * Build a map of date strings to day numbers from LEAP_DAYS
 * 
 * @returns Map<dateString, dayNumber>
 * 
 * @example
 * const dayMap = buildStaticDayMap();
 * dayMap.get('June 19, 2026') // → 1
 * dayMap.get('June 30, 2026') // → undefined (no class that day)
 */
export function buildStaticDayMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const day of LEAP_DAYS) {
    map.set(day.date, day.num);
  }
  return map;
}

/**
 * Get the day number for a given date, or undefined if not in LEAP_DAYS
 */
export function getDayNumber(date: string): number | undefined {
  return buildStaticDayMap().get(date);
}
