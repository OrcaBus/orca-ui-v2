/**
 * Copy text to clipboard; on success calls onSuccess.
 */
export async function copyToClipboard(text: string, onSuccess: () => void): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess();
  } catch {
    // Silently fail
  }
}
