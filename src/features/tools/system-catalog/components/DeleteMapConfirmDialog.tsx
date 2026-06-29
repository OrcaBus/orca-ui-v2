interface DeleteMapConfirmDialogProps {
  mapName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteMapConfirmDialog({
  mapName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteMapConfirmDialogProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onCancel} />
      <div className='relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <h3 className='text-base font-bold text-slate-900 dark:text-white'>Archive Map</h3>
        <p className='mt-2 text-sm text-slate-500 dark:text-[#9dabb9]'>
          Are you sure you want to archive{' '}
          <strong className='text-slate-700 dark:text-white'>{mapName}</strong>? It will be hidden
          from the active map list.
        </p>
        <div className='mt-5 flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isDeleting}
            className='rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isDeleting}
            className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isDeleting ? 'Archiving…' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}
