import type { IsoDate } from './types.ts';

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses an ISO date string as midnight UTC. Throws on malformed input. */
export function parseDate(value: IsoDate): number {
  if (!ISO_DATE.test(value)) throw new Error(`Invalid date "${value}", expected YYYY-MM-DD`);
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const time = Date.UTC(y, m - 1, d);
  const check = new Date(time);
  if (check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    throw new Error(`Invalid date "${value}"`);
  }
  return time;
}

export function isValidDate(value: string): boolean {
  try {
    parseDate(value);
    return true;
  } catch {
    return false;
  }
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((parseDate(to) - parseDate(from)) / MS_PER_DAY);
}

/** Fraction (0 to 1) of the span from `start` to `end` that has elapsed at `asOf`. */
export function elapsedFraction(start: IsoDate, end: IsoDate, asOf: IsoDate): number {
  const total = daysBetween(start, end);
  if (total <= 0) return daysBetween(end, asOf) >= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, daysBetween(start, asOf) / total));
}
