import { FolderSync, Loader2, X } from 'lucide-react';

interface AutoImportFromRedcapDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AutoImportFromRedcapDialog({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: AutoImportFromRedcapDialogProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={() => !isLoading && onClose()} />

      <div className='relative w-full max-w-md rounded-lg border border-transparent bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <button
          onClick={onClose}
          disabled={isLoading}
          className='absolute top-4 right-4 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2d3540] dark:hover:text-slate-200'
        >
          <X className='h-4 w-4' />
        </button>

        <div className='flex items-start gap-4 p-6'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10'>
            <FolderSync className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>

          <div className='min-w-0 flex-1 pr-4'>
            <h2 className='text-base font-semibold text-neutral-900 dark:text-slate-100'>
              Auto Import from REDCap
            </h2>
            <p className='mt-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>
              This will automatically sync cases from REDCap using the default date range. Do you
              want to proceed?
            </p>
          </div>
        </div>

        <div className='border-t border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <div className='flex items-center justify-end gap-2'>
            <button
              onClick={onClose}
              disabled={isLoading}
              className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Importing...
                </>
              ) : (
                'Auto Import'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
