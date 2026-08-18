import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
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
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='button' variant='destructive' onClick={onConfirm}>
            Remove
          </Button>
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
