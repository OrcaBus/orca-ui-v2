import { FolderSync, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useCaseSyncFromRedcapAutoModel, CASE_LIST_PATH } from '../api/cases.api';

interface AutoImportFromRedcapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AutoImportFromRedcapModal({
  isOpen,
  onClose,
  onSuccess,
}: AutoImportFromRedcapModalProps) {
  const queryClient = useQueryClient();
  const { mutate: syncFromRedcap, isPending: isLoading } = useCaseSyncFromRedcapAutoModel();

  const handleConfirm = () => {
    syncFromRedcap(
      {},
      {
        onSuccess: () => {
          toast.success('Cases imported from REDCap');
          void queryClient.invalidateQueries({ queryKey: ['get', CASE_LIST_PATH] });
          onClose();
          onSuccess?.();
        },
        onError: () => {
          toast.error('Failed to import cases from REDCap');
        },
      }
    );
  };
  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title='Auto Import from REDCap'
      icon={<FolderSync className='h-5 w-5' />}
      size='sm'
      footer={
        <div className='flex items-center justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
            )}
          >
            Cancel
          </button>
          <Button type='button' onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='animate-spin' />
                Importing...
              </>
            ) : (
              'Auto Import'
            )}
          </Button>
        </div>
      }
    >
      <p className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
        This will automatically sync cases from REDCap using the default date range. Do you want to
        proceed?
      </p>
    </DialogFrame>
  );
}
