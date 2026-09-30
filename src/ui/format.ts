import { parseDate } from '../domain/dates.ts';
import type { IsoDate } from '../domain/types.ts';

/** Compact money for dashboards: $7.18M, $240K, $950. */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumSignificantDigits: 3,
  }).format(amount);
}

/** Signed money for variances: +$240K, −$90K. */
export function formatVariance(amount: number, currency: string): string {
  if (amount === 0) return formatMoney(0, currency);
  const sign = amount > 0 ? '+' : '−';
  return sign + formatMoney(Math.abs(amount), currency);
}

export function formatDate(date: IsoDate): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDate(date));
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
