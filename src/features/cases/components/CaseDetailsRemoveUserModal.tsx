import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';
import { useCaseRemoveUserModel } from '../api/cases.api';

export interface CaseDetailsRemoveUserModalProps {
  isOpen: boolean;
  caseOrcabusId: string;
  userOrcabusId: string;
  userEmail: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CaseDetailsRemoveUserModal({
  isOpen,
  caseOrcabusId,
  userOrcabusId,
  userEmail,
  onClose,
  onSuccess,
}: CaseDetailsRemoveUserModalProps) {
  const removeMutation = useCaseRemoveUserModel();
  // Keep the email so the message stays intact while the dialog animates closed.
  const shownEmail = useLastPresent(userEmail);

  const handleConfirm = () => {
    removeMutation.mutate(
      {
        params: { path: { orcabusId: caseOrcabusId, userOrcabusId } },
      },
      {
        onSuccess: () => {
          toast.success(`User ${userEmail ?? ''} removed from case`);
          onSuccess();
          onClose();
        },
        onError: () => {
          toast.error('Failed to remove user');
        },
      }
    );
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Remove User'
      size='sm'
      closeDisabled={removeMutation.isPending}
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={removeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleConfirm}
            disabled={removeMutation.isPending}
          >
            <Trash2 className='h-4 w-4' />
            {removeMutation.isPending ? 'Removing…' : 'Remove'}
          </Button>
        </>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          Are you sure you want to remove{' '}
          <strong className='font-medium text-neutral-900 dark:text-white'>{shownEmail}</strong>?
        </p>
        <p className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
          This will revoke their access to this case. This action cannot be undone.
        </p>
      </div>
    </DialogFrame>
  );
}
