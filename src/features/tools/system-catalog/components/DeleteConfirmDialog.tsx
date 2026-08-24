import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';

interface DeleteConfirmDialogProps {
  nodeLabel: string | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  nodeLabel,
  isOpen,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  // Keep the label so the message stays intact while the dialog animates closed.
  const shown = useLastPresent(nodeLabel);

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title='Remove Node'
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
        <strong className='font-medium text-neutral-900 dark:text-white'>{shown}</strong>? This will
        also remove all edges connected to this node.
      </p>
    </DialogFrame>
  );
}
