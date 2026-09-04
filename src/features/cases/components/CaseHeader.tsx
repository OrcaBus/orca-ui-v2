import { Copy, Edit, FolderSync } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { useCaseSyncFromRedcapModel } from '../api/cases.api';
import { EditCaseModal } from './EditCaseModal';

export function CaseHeader() {
  const { caseDetail, isLoadingCaseDetail, refresh } = useCaseDetailsContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: syncFromRedcap, isPending: isSyncingFromRedcap } = useCaseSyncFromRedcapModel();

  const isLoading = isLoadingCaseDetail && !caseDetail;

  const handleCopyOrcabusId = () => {
    void navigator.clipboard.writeText(caseDetail?.orcabusId ?? '');
    toast.success('Orcabus ID copied to clipboard');
  };

  const handleRefreshFromRedcap = () => {
    if (!caseDetail) return;
    syncFromRedcap(
      { params: { path: { orcabusId: caseDetail.orcabusId } } },
      {
        onSuccess: () => {
          toast.success('Case refreshed from REDCap');
          refresh();
        },
        onError: () => {
          toast.error('Failed to refresh case from REDCap');
        },
      }
    );
  };

  return (
    <>
      <div className='my-4 flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-3'>
            {isLoading ? (
              <Skeleton className='h-7 w-64' />
            ) : (
              <h1 className='text-xl font-semibold text-neutral-900 dark:text-white'>
                {caseDetail?.requestFormId ?? '—'}
              </h1>
            )}
          </div>
          <div className='flex items-center gap-4 text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {isLoading ? (
              <Skeleton className='h-4 w-48' />
            ) : (
              <span className='flex items-center gap-1.5'>
                Orcabus ID: <span className='font-mono'>{caseDetail?.orcabusId ?? '—'}</span>
                {caseDetail?.orcabusId && (
                  <Button
                    variant='ghost'
                    type='button'
                    onClick={handleCopyOrcabusId}
                    aria-label='Copy Orcabus ID'
                    className='rounded p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-[#2d3540]'
                  >
                    <Copy className='h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white' />
                  </Button>
                )}
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            type='button'
            onClick={handleRefreshFromRedcap}
            disabled={!caseDetail || isSyncingFromRedcap}
            className='rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#1e252e]'
          >
            <FolderSync className={isSyncingFromRedcap ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh from REDCap
          </Button>

          <Button onClick={() => setIsEditOpen(true)}>
            <Edit className='h-4 w-4' />
            Edit Case
          </Button>
        </div>
      </div>

      <EditCaseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
