import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';

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
          <Button type='button' variant='outline' onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type='button' variant='destructive' onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Archiving…' : 'Archive'}
          </Button>
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
