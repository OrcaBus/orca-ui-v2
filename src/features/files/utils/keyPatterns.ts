export function appendKeyPattern(patterns: string[], pattern: string): string[] {
  const trimmed = pattern.trim();
  if (!trimmed || patterns.includes(trimmed)) return patterns;
  return [...patterns, trimmed];
}

export function removeKeyPattern(patterns: string[], index: number): string[] {
  return patterns.filter((_, i) => i !== index);
}
