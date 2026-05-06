import { toast } from 'sonner';

/**
 * Copy text to clipboard and show toast.
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Path copied to clipboard');
  } catch {
    // Silently fail
  }
}
