import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeViewer({ code, title }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Try modern Clipboard API first, silently fall back if blocked
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fall back to textarea method
          const textArea = document.createElement('textarea');
          textArea.value = code;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Silently fail
          }

          textArea.remove();
        });
    } else {
      // Use fallback method if Clipboard API unavailable
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail
      }

      textArea.remove();
    }
  };

  return (
    <div className='overflow-hidden rounded-lg bg-neutral-900'>
      {title && (
        <div className='flex items-center justify-between border-b border-neutral-700 bg-neutral-800 px-4 py-2'>
          <span className='text-xs font-medium text-neutral-300'>{title}</span>
          <button
            onClick={handleCopy}
            className='flex items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white'
          >
            {copied ? (
              <>
                <Check className='h-3 w-3' />
                Copied
              </>
            ) : (
              <>
                <Copy className='h-3 w-3' />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className='overflow-x-auto p-4'>
        <pre className='font-mono text-xs leading-relaxed text-neutral-100'>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
