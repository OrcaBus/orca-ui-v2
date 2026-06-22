export const SYNC_START_YEAR = 2017;
export const DEFAULT_GSHEET_PREVIEW_RANGE = '1:10';

const GSHEET_RANGE_INPUT_REGEX = /^(\d+(?::\d+)?)(,\s*\d+(?::\d+)?)*$/;

export function buildSyncYears(
  currentYear = new Date().getFullYear(),
  startYear = SYNC_START_YEAR
): number[] {
  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => currentYear - index);
}

export function hasGsheetRanges(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidGsheetRangeInput(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && GSHEET_RANGE_INPUT_REGEX.test(trimmed);
}

export function sanitizeGsheetRanges(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? `${part}:${part}` : part));
}

export function resolveGsheetPreviewRanges(value: string): string[] {
  return hasGsheetRanges(value) ? sanitizeGsheetRanges(value) : [DEFAULT_GSHEET_PREVIEW_RANGE];
}

export function formatResponse(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function formatErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    if (typeof obj.message === 'string') return obj.message;
    return JSON.stringify(obj);
  }
  return String(error);
}
