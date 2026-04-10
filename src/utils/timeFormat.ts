/**
 * Time formatting utilities for Orcabus LIMS
 *
 * Uses dayjs (https://day.js.org/) for parsing, formatting, and relative time.
 *
 * Standard formats:
 * - Backend/API/storage: 2026-02-05T03:09:00Z (UTC ISO 8601)
 * - UI table cells (sortable): 2026-02-05 14:09 +11:00
 * - UI detail display (human-friendly): 05 Feb 2026, 14:09 (UTC+11:00)
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** Display timezone offset (e.g. Australia/Melbourne). Configurable from user preferences. */
const DISPLAY_UTC_OFFSET = 11; // UTC+11:00

/**
 * Parse an ISO string and return a dayjs instance in the display timezone (UTC+11).
 * Ensures consistent parsing and avoids invalid-date edge cases.
 */
function parseInDisplayZone(isoString: string): dayjs.Dayjs {
  return dayjs.utc(isoString).utcOffset(DISPLAY_UTC_OFFSET);
}

/**
 * Format date for UI table cells (sortable)
 * @param isoString - ISO 8601 date string (e.g., "2026-02-05T03:09:00Z")
 * @returns Formatted string: "2026-02-05 14:09 +11:00"
 */
export function formatTableDate(isoString: string): string {
  const d = parseInDisplayZone(isoString);
  if (!d.isValid()) return isoString;
  return d.format('YYYY-MM-DD HH:mm Z');
}

/**
 * Format date for UI detail display (human-friendly)
 * @param isoString - ISO 8601 date string (e.g., "2026-02-05T03:09:00Z")
 * @returns Formatted string: "05 Feb 2026, 14:09 (UTC+11:00)"
 */
export function formatDetailDate(isoString: string): string {
  const d = parseInDisplayZone(isoString);
  if (!d.isValid()) return isoString;
  return d.format('DD MMM YYYY, HH:mm (UTCZ)');
}

/**
 * Format date for backend/API/storage (UTC ISO 8601)
 * @param date - Date object
 * @returns ISO 8601 string: "2026-02-05T03:09:00Z"
 */
export function formatBackendDate(date: Date): string {
  return dayjs.utc(date).toISOString();
}

/**
 * Convert a date-only string (YYYY-MM-DD) to UTC start-of-day format for API query params.
 * @returns e.g. "2025-11-06T00:00:00+00:00", or undefined when input is empty/invalid.
 */
export function formatQueryDateToUtcStartOfDay(
  dateString: string | null | undefined
): string | undefined {
  if (!dateString) return undefined;
  const d = dayjs.utc(dateString);
  if (!d.isValid()) return undefined;
  return d.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Alias for API query params date conversion.
 * Kept for readability in query-params hooks.
 */
export function toUtcStartOfDayQueryParam(
  dateString: string | null | undefined
): string | undefined {
  if (!dateString) return undefined;
  const d = dayjs.utc(dateString);
  if (!d.isValid()) return undefined;
  return d.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Get relative time description (e.g., "2h ago", "just now")
 * Useful for timestamps that need human-friendly relative formatting
 */
export function getRelativeTime(isoString: string): string {
  const d = dayjs.utc(isoString);
  if (!d.isValid()) return isoString;

  const now = dayjs.utc();
  const diffMins = now.diff(d, 'minute');
  const diffHours = now.diff(d, 'hour');
  const diffDays = now.diff(d, 'day');

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDetailDate(isoString);
}
