import type { LeapEvent } from "../services/leapify";
import type { MainEvent, LeapClass } from "../types";

const ACCENT_COLORS = [
  "#de9a49",
  "#4ab09a",
  "#b05a32",
  "#5ca0a8",
  "#803e2f",
];

const DEFAULT_EVENT_IMG = "https://placehold.co/812x510?text=No+Image+Found";
const DEFAULT_CLASS_IMG = "https://picsum.photos/seed/leap/400/250";

function formatTime(
  startTime: string | null,
  endTime: string | null,
): string {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || "";
}

/**
 * Map a LeapEvent to a MainEvent display object (for spotlight/carousel).
 */
export function toMainEvent(event: LeapEvent, index: number): MainEvent {
  return {
    id: event.id,
    title: event.title || "Untitled Event",
    description: event.description || "",
    img: event.backgroundImageUrl || DEFAULT_EVENT_IMG,
    tag: event.theme?.name || "LEAP 2026",
    accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
    date: event.date || "",
    time: formatTime(event.startTime, event.endTime),
    venue: event.venue || "",
    capacity: event.maxSlots || 0,
  };
}

/**
 * Map a LeapEvent to a LeapClass display object (for class listings).
 */
export function toLeapClass(event: LeapEvent): LeapClass {
  return {
    id: event.id,
    title: event.title || "",
    org: event.organization?.name || "",
    date: event.date || "",
    time: formatTime(event.startTime, event.endTime),
    venue: event.venue || "",
    slots: event.maxSlots || 0,
    subtheme: event.theme?.name || "",
    image: event.backgroundImageUrl || DEFAULT_CLASS_IMG,
    orgLogo: event.organization?.logoUrl || null,
    googleFormUrl: event.gformsUrl || "",
    description: event.description || "No description provided for this class.",
    isSpotlight: event.isSpotlight,
  };
}
