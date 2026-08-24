import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';

interface DeleteEventConfirmDialogProps {
  eventName: string | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteEventConfirmDialog({
  eventName,
  isOpen,
  onConfirm,
  onCancel,
}: DeleteEventConfirmDialogProps) {
  // Keep the name so the message stays intact while the dialog animates closed.
  const shown = useLastPresent(eventName);

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title='Remove Event'
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
        Are you sure you want to remove the event{' '}
        <strong className='font-mono font-medium text-neutral-900 dark:text-white'>{shown}</strong>?
        This cannot be undone.
      </p>
    </DialogFrame>
  );
}
