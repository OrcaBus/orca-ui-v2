import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCaseRemoveUserModel } from '../api/cases.api';

export interface CaseDetailsRemoveUserModalProps {
  isOpen: boolean;
  caseOrcabusId: string;
  userOrcabusId: string;
  userEmail: string;
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

  const handleConfirm = () => {
    removeMutation.mutate(
      {
        params: { path: { orcabusId: caseOrcabusId, userOrcabusId } },
      },
      {
        onSuccess: () => {
          toast.success(`User ${userEmail} removed from case`);
          onSuccess();
          onClose();
        },
        onError: () => {
          toast.error('Failed to remove user');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-[#2d3540] dark:bg-[#1e252e]'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10'>
            <Trash2 className='h-5 w-5 text-red-600 dark:text-red-400' />
          </div>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-white'>Remove User</h2>
        </div>
        <p className='mb-1 text-sm text-neutral-600 dark:text-[#9dabb9]'>
          Are you sure you want to remove
        </p>
        <p className='mb-5 text-sm font-medium text-neutral-900 dark:text-white'>{userEmail}</p>
        <p className='mb-6 text-sm text-neutral-500 dark:text-[#9dabb9]'>
          This will revoke their access to this case. This action cannot be undone.
        </p>
        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={removeMutation.isPending}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={removeMutation.isPending}
            className='flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'
          >
            <Trash2 className='h-4 w-4' />
            {removeMutation.isPending ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
