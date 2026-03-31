import { toast } from 'sonner';

/**
 * Copy text to clipboard and show toast. Falls back to execCommand if Clipboard API is unavailable.
 */
export function copyToClipboard(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Path copied to clipboard'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const success = document.execCommand('copy');
    if (success) toast.success('Path copied to clipboard');
  } catch {
    // Silently fail
  }
  textArea.remove();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const FILE_TYPE_BADGE_STYLES: Record<string, string> = {
  VCF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  BAM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  BAI: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  PDF: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  LOG: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  FASTQ: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  CSV: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  TSV: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  HTML: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
};

export function getFileTypeBadgeStyle(type: string): string {
  return (
    FILE_TYPE_BADGE_STYLES[type.toUpperCase()] ??
    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
  );
}
