import { PillTag } from '../../../components/ui/PillTag';
import { formatDetailDate } from '../../../utils/timeFormat';
import type { Case } from '../types/case.types';
import { getCaseTypeVariant } from '../utils/getCaseTypeVariant';

interface CaseOverviewCardProps {
  case_: Case;
}

export function CaseOverviewCard({ case_: caseData }: CaseOverviewCardProps) {
  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-[#111418]'>
      <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Title</div>
          <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {caseData.title}
          </div>
        </div>
        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Alias</div>
          <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {caseData.alias || '—'}
          </div>
        </div>
        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Type</div>
          <div>
            <PillTag variant={getCaseTypeVariant(caseData.type)} size='sm'>
              {caseData.type}
            </PillTag>
          </div>
        </div>
        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Last Modified</div>
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatDetailDate(caseData.lastModified)}
          </div>
        </div>
        <div className='col-span-2'>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Description</div>
          <div className='text-sm text-neutral-700 dark:text-neutral-300'>
            {caseData.description || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
