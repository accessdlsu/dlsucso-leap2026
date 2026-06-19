export function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr ?? '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Utility helper to shorten long DLSU venues to fit within UI designs.
 */
export function shortenVenue(venue: string): string {
  if (!venue) return "";
  let v = venue;

  // Replace long building names with shorter equivalents
  v = v.replace(/Enrique\s+M\.\s+Razon\s+Sports\s+Center/gi, "Razon");
  v = v.replace(/Enrique\s+Razon\s+Sports\s+Center/gi, "Razon");
  v = v.replace(/Henry\s+Sy\s+Sr\.\s+Hall/gi, "Henry Sy");
  v = v.replace(/Andrew\s+Gonzalez\s+Hall/gi, "Andrew Hall");
  v = v.replace(/St\.\s+La\s+Salle\s+Hall/gi, "LS Hall");
  v = v.replace(/St\s+La\s+Salle\s+Hall/gi, "LS Hall");
  v = v.replace(/William\s+Shaw\s+Little\s+Theater/gi, "Shaw Theater");
  v = v.replace(/Science\s+and\s+Technology\s+Research\s+Center/gi, "STRC");
  v = v.replace(/Br\.\s+Connon\s+Hall/gi, "Connon Hall");

  // If still extremely long, compress floor/court descriptions
  if (v.length > 25) {
    v = v.replace(/Floor/gi, "F")
         .replace(/and/gi, "&")
         .replace(/Court/gi, "Ct");
  }

  // Final truncation to safe limits to prevent visual overflows
  if (v.length > 28) {
    return v.substring(0, 25) + "...";
  }

  return v;
}

/**
 * @deprecated Use buildStaticDayMap() from constants/leapDays.ts instead
 * This function is kept for backwards compatibility but should not be used in new code.
 * 
 * Days should come from LEAP_DAYS constant to ensure consistency across frontend.
 */
export function buildDayMap(events: { date: string }[]): Map<string, number> {
  // Import here to avoid circular dependency
  const { buildStaticDayMap } = require('../constants/leapDays');
  return buildStaticDayMap();
}
