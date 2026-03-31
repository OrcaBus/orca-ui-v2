/**
 * Pretty-print JSON string; returns original string if invalid.
 * Useful for JSON textareas and formatting user input.
 */
export function tryPrettyJson(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '{}';
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}
