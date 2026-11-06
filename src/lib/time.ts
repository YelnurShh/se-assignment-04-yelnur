/**
 * Convert minutes-from-midnight to "HH:MM" 24-hour display.
 */
export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Parse "HH:MM" (24-hour) into minutes from midnight.
 */
export function labelToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h === 24 && m === 0) return 1440;
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Two intervals [a1,a2) and [b1,b2) overlap iff a1 < b2 and b1 < a2.
 * Touching endpoints (a2 === b1 or b2 === a1) do NOT overlap.
 */
export function intervalsOverlap(
  a1: number,
  a2: number,
  b1: number,
  b2: number,
): boolean {
  return a1 < b2 && b1 < a2;
}
