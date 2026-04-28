/**
 * Shared utility functions for building, displaying, and handling URL query params
 * across all query params hooks and functions.
 */

import type { SortDirection } from '@/hooks/useQueryParams';

/**
 * Orders a field based on the sort direction.
 * Returns the field name prefixed with '-' for descending order, or the field name as-is for ascending order.
 * Example: orderByParam('asc', 'name') => 'name', orderByParam('desc', 'name') => '-name'
 * This format is commonly used in APIs to indicate sorting direction.
 */
export function orderByParam(direction: SortDirection, field: string): string {
  return direction === 'desc' ? `-${field}` : field;
}

/**
 * Returns the first string value from a string, array, or undefined.
 * Returns empty string if null/undefined.
 */
export function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

/**
 * Parses a value (string, array, or undefined) into an array of trimmed, non-empty strings.
 * Supports comma-separated values within each string entry.
 */
export function parseCsvValues(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((entry) => entry.split(','))
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Converts a value to a comma-separated string for display.
 */
export function toCsvString(value: string | string[] | undefined): string {
  return parseCsvValues(value).join(',');
}

/**
 * Converts parsed CSV values to a query param value:
 * undefined if empty, a single string if one value, or an array if multiple.
 */
export function toQueryParamValue(
  value: string | string[] | undefined
): string | string[] | undefined {
  const values = parseCsvValues(value);
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

/**
 * Returns the first CSV-parsed value, or undefined if none.
 */
export function toFirstCsvValue(value: string | string[] | undefined): string | undefined {
  const first = parseCsvValues(value)[0];
  return first || undefined;
}

/**
 * Parses CSV values into a number array. Returns undefined if no valid numbers.
 */
export function toNumberArray(value: string | string[] | undefined): number[] | undefined {
  const numbers = parseCsvValues(value)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  return numbers.length ? numbers : undefined;
}

/**
 * Parses the first CSV value to a number. Returns undefined if not a valid finite number.
 */
export function toNumber(value: string | string[] | undefined): number | undefined {
  const first = toFirstCsvValue(value);
  if (!first?.trim()) return undefined;
  const number = Number(first);
  return Number.isFinite(number) ? number : undefined;
}

/**
 * Converts a string array to a query param value:
 * undefined if empty, a single string if one value, or an array if multiple.
 */
export function toStringOrArray(values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

/**
 * Converts a search input string to a query param value.
 */
export function toSearchQueryValue(value: string): string | string[] | undefined {
  return toQueryParamValue(value);
}

/**
 * Converts a filter input value to a query param value.
 */
export function toFilterQueryValue(
  value: string | string[] | undefined
): string | string[] | undefined {
  return toQueryParamValue(value);
}

/**
 * Parses a value into a list of CSV strings (alias for parseCsvValues).
 */
export function toCsvList(value: string | string[] | undefined): string[] {
  return parseCsvValues(value);
}

/**
 * Converts a query param value to a display string for a search field.
 */
export function toSearchDisplayValue(value: string | string[] | undefined): string {
  return toCsvString(value);
}

/**
 * Converts a query param value to a display string for a filter field.
 */
export function toFilterDisplayValue(value: string | string[] | undefined): string {
  return toCsvString(value);
}

/**
 * Converts a search display string to an API query param value (CSV-aware).
 */
export function toSearchApiQueryValue(value: string): string | string[] | undefined {
  const values = toCsvList(value);
  return toStringOrArray(values);
}

/**
 * Converts a CSV display string to an API query param value.
 */
export function toApiCsvQueryValue(value: string): string | string[] | undefined {
  const values = toCsvList(value);
  return toStringOrArray(values);
}
