/**
 * Copy text to clipboard; on success calls onSuccess. Falls back to execCommand if needed.
 */
export function copyToClipboard(text: string, onSuccess: () => void): void {
  const doFallback = () => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch {
      // Silently fail
    }
    textArea.remove();
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(doFallback);
  } else {
    doFallback();
  }
}
