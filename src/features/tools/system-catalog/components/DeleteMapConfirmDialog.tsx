import { DialogFrame } from '@/components/modals/DialogFrame';

interface DeleteMapConfirmDialogProps {
  mapName: string;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteMapConfirmDialog({
  mapName,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteMapConfirmDialogProps) {
  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title='Archive Map'
      size='sm'
      closeDisabled={isDeleting}
      footer={
        <>
          <button
            type='button'
            onClick={onCancel}
            disabled={isDeleting}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isDeleting}
            className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isDeleting ? 'Archiving…' : 'Archive'}
          </button>
        </>
      }
    >
      <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
        Are you sure you want to archive{' '}
        <strong className='font-medium text-neutral-900 dark:text-white'>{mapName}</strong>? It will
        be hidden from the active map list.
      </p>
    </DialogFrame>
  );
}
