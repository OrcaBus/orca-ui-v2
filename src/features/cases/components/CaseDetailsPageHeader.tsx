import { useState } from 'react';
import { Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { EditCaseModal } from './EditCaseModal';

export function CaseDetailsPageHeader() {
  const { caseDetail, isLoadingCaseDetail } = useCaseDetailsContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          {isLoadingCaseDetail ? (
            <Skeleton className='mb-1 h-8 w-64' />
          ) : (
            <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.requestFormId ?? '—'}
              {caseDetail?.alias && caseDetail.alias.length > 0 && (
                <span className='ml-3 font-mono text-lg font-normal text-neutral-500 dark:text-neutral-400'>
                  {caseDetail.alias.join(', ')}
                </span>
              )}
            </h1>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsEditOpen(true)}
            className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-200 dark:hover:bg-neutral-700/50'
          >
            <Edit className='h-4 w-4' />
            Edit Case
          </button>
        </div>
      </div>

      <EditCaseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
