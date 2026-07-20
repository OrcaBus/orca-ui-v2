import { DialogFrame } from '@/components/modals/DialogFrame';
import { useLastPresent } from '@/hooks/useLastPresent';

interface DeleteGroupConfirmDialogProps {
  groupName: string | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteGroupConfirmDialog({
  groupName,
  isOpen,
  onConfirm,
  onCancel,
}: DeleteGroupConfirmDialogProps) {
  // Keep the name so the message stays intact while the dialog animates closed.
  const shown = useLastPresent(groupName);

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title='Remove Group'
      size='sm'
      footer={
        <>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
          >
            Remove
          </button>
        </>
      }
    >
      <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
        Are you sure you want to remove{' '}
        <strong className='font-medium text-neutral-900 dark:text-white'>{shown}</strong>? Nodes in
        this group will not be deleted.
      </p>
    </DialogFrame>
  );
}
