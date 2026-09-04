/**
 * Time formatting utilities for Orcabus LIMS
 *
 * Uses dayjs (https://day.js.org/) for parsing, formatting, and relative time.
 *
 * Standard formats:
 * - Backend/API/storage: 2026-02-05T03:09:00Z (UTC ISO 8601)
 * - UI display timezone: Australia/Melbourne
 * - UI table cells (sortable): 2026-02-05 14:09 +11:00
 * - UI detail display (human-friendly): 05 Feb 2026, 14:09 (UTC+11:00)
 * - Native datetime-local inputs: 2026-02-05T14:09
 */

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Display timezone. Configurable from user preferences later. */
const DISPLAY_TIME_ZONE = 'Australia/Melbourne';
const API_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const API_TIME_PATTERN = /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?$/;

/**
 * Parse an ISO string and return a dayjs instance in the display timezone.
 * Ensures consistent parsing and avoids invalid-date edge cases.
 */
function parseInDisplayZone(isoString: string): dayjs.Dayjs {
  return dayjs.utc(isoString).tz(DISPLAY_TIME_ZONE);
}

/** Format a backend calendar date without applying a timezone conversion. */
export function formatCalendarDate(dateString: string): string {
  if (!API_DATE_PATTERN.test(dateString)) return dateString;

  const d = dayjs.utc(dateString);
  if (!d.isValid() || d.format('YYYY-MM-DD') !== dateString) return dateString;
  return d.format('DD MMM YYYY');
}

/** Compose split backend date/time fields as an instant in the display timezone. */
export function composeDisplayZoneDateTime(
  dateString: string,
  timeString: string
): string | undefined {
  if (!API_DATE_PATTERN.test(dateString) || !API_TIME_PATTERN.test(timeString)) return undefined;

  const d = dayjs.tz(`${dateString}T${timeString}`, DISPLAY_TIME_ZONE);
  if (!d.isValid() || d.format('YYYY-MM-DD') !== dateString) return undefined;
  return d.toISOString();
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
 * Format date for compact UI display (e.g. stepper timestamps)
 * @param isoString - ISO 8601 date string (e.g., "2026-02-05T03:09:00Z")
 * @returns Formatted string: "05/02/26"
 */
export function formatShortDate(isoString: string): string {
  const d = parseInDisplayZone(isoString);
  if (!d.isValid()) return isoString;
  return d.format('DD/MM/YY');
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
 * Format an ISO date for native datetime-local inputs in the display timezone.
 * @returns e.g. "2026-02-05T14:09", or undefined when input is empty/invalid.
 */
export function formatDateTimeLocalInputValue(
  isoString: string | null | undefined
): string | undefined {
  if (!isoString) return undefined;
  const d = parseInDisplayZone(isoString);
  if (!d.isValid()) return undefined;
  return d.format('YYYY-MM-DDTHH:mm');
}

/**
 * Convert a date-only string (YYYY-MM-DD) to UTC start-of-day format for API query params.
 * @returns e.g. "2025-11-06T00:00:00+00:00", or undefined when input is empty/invalid.
 */
export function toUtcStartOfDay(dateString: string | null | undefined): string | undefined {
  if (!dateString) return undefined;
  const d = dayjs.utc(dateString);
  if (!d.isValid()) return undefined;
  return d.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Convert a date-only string (YYYY-MM-DD) to display-timezone start-of-day for API query params.
 * The resulting timestamp is anchored to the display timezone to match table/detail local-time presentation.
 * @returns e.g. "2025-11-06T00:00:00+11:00", or undefined when input is empty/invalid.
 */
export function toLocalStartOfDay(dateString: string | null | undefined): string | undefined {
  if (!dateString) return undefined;
  const d = dayjs.tz(dateString, DISPLAY_TIME_ZONE);
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
