export const EMPTY_CASE_VALUE = '—';

/** Normalizes optional backend-managed text for consistent case presentation. */
export function formatCaseText(value: string | null | undefined): string {
  return value?.trim() || EMPTY_CASE_VALUE;
}
