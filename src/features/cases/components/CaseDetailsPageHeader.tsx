import { useState } from 'react';
import { Copy, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PillTag } from '@/components/ui/PillTag';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { EditCaseModal } from './EditCaseModal';

export function CaseDetailsPageHeader() {
  const { caseDetail, isLoadingCaseDetail } = useCaseDetailsContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleCopyOrcabusId = () => {
    void navigator.clipboard.writeText(caseDetail?.orcabusId ?? '');
    toast.success('Orcabus ID copied to clipboard');
  };

  return (
    <>
      <div className='my-4 flex items-start justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            {isLoadingCaseDetail ? (
              <Skeleton className='h-7 w-64' />
            ) : (
              <>
                <h1 className='text-xl font-semibold text-neutral-900 dark:text-white'>
                  {caseDetail?.requestFormId ?? '—'}
                </h1>
                {caseDetail?.type && (
                  <PillTag variant='blue' size='sm'>
                    {caseDetail.type.toUpperCase()}
                  </PillTag>
                )}
                {caseDetail?.alias && caseDetail.alias.length > 0 && (
                  <span className='font-mono text-sm font-normal text-neutral-500 dark:text-neutral-400'>
                    {caseDetail.alias.join(', ')}
                  </span>
                )}
              </>
            )}
          </div>
          <div className='flex items-center gap-4 text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {isLoadingCaseDetail ? (
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
