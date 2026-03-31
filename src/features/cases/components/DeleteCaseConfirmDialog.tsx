import { Trash2 } from 'lucide-react';
import type { Case } from '../types/case.types';

interface DeleteCaseConfirmDialogProps {
  case_: Case;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCaseConfirmDialog({
  case_,
  onConfirm,
  onCancel,
}: DeleteCaseConfirmDialogProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onCancel} />

      <div className='relative w-full max-w-md rounded-lg border border-transparent bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
            Delete case?
          </h2>
        </div>

        <div className='p-6'>
          <p className='mb-3 text-sm text-neutral-600 dark:text-[#9dabb9]'>
            <strong className='text-neutral-900 dark:text-slate-100'>{case_.title}</strong>
          </p>
          <p className='text-sm text-red-600 dark:text-red-400'>
            This will remove the case and its links. This action can&apos;t be undone.
          </p>
        </div>

        <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
          <div className='flex items-center justify-end gap-2'>
            <button
              onClick={onCancel}
              className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
