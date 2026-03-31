import { Info, Loader2, Sparkles } from 'lucide-react';

interface AutoGenerateCasesModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AutoGenerateCasesModal({
  isOpen,
  isGenerating,
  onClose,
  onConfirm,
}: AutoGenerateCasesModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={() => !isGenerating && onClose()} />

      <div className='relative w-full max-w-md rounded-lg border border-transparent bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
            Auto-generate Cases
          </h2>
        </div>

        <div className='space-y-4 p-6'>
          <p className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
            This will automatically generate new cases based on predefined logic. The system will
            analyze existing data and create cases according to configured rules.
          </p>

          <div className='flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-500/10'>
            <Info className='mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-sm text-blue-900 dark:text-blue-100'>
              Please review the generated cases after completion to ensure they meet your
              requirements.
            </p>
          </div>
        </div>

        <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
          <div className='flex items-center justify-end gap-2'>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isGenerating}
              className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='h-4 w-4' />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
