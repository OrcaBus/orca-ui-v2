import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
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
          <button
            type='button'
            onClick={onClose}
            disabled={removeMutation.isPending}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={removeMutation.isPending}
            className='flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Trash2 className='h-4 w-4' />
            {removeMutation.isPending ? 'Removing…' : 'Remove'}
          </button>
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
