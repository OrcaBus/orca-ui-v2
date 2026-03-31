import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { X, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PayloadViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payload: Record<string, unknown>;
  eventId: string;
}

export function PayloadViewerDialog({
  isOpen,
  onClose,
  payload,
  eventId,
}: PayloadViewerDialogProps) {
  const formattedJson = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    // Try modern Clipboard API first, silently fall back if blocked
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(formattedJson)
        .then(() => {
          toast.success('Payload copied to clipboard');
        })
        .catch(() => {
          // Fall back to textarea method
          const textArea = document.createElement('textarea');
          textArea.value = formattedJson;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const success = document.execCommand('copy');
            if (success) {
              toast.success('Payload copied to clipboard');
            }
          } catch {
            // Silently fail
          }

          textArea.remove();
        });
    } else {
      // Use fallback method if Clipboard API unavailable
      const textArea = document.createElement('textarea');
      textArea.value = formattedJson;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand('copy');
        if (success) {
          toast.success('Payload copied to clipboard');
        }
      } catch {
        // Silently fail
      }

      textArea.remove();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-payload.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Payload downloaded');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      {/* Backdrop */}
      <TransitionChild
        enter='ease-out duration-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='fixed inset-0 bg-black/30 dark:bg-black/50' aria-hidden='true' />
      </TransitionChild>

      {/* Full-screen container */}
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <TransitionChild
          enter='ease-out duration-200'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <DialogPanel className='w-full max-w-3xl rounded-lg bg-white shadow-xl dark:bg-neutral-900'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800'>
              <DialogTitle className='font-semibold text-neutral-900 dark:text-neutral-100'>
                Event Payload
              </DialogTitle>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleCopy}
                  className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  title='Copy to clipboard'
                >
                  <Copy className='h-4 w-4' />
                </button>
                <button
                  onClick={handleDownload}
                  className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  title='Download JSON'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  onClick={onClose}
                  className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='max-h-[60vh] overflow-auto p-6'>
              <pre className='overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100'>
                {formattedJson}
              </pre>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  );
}
