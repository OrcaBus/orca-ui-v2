import { PillTag } from '../../../components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCalendarDate, formatDetailDate } from '../../../utils/timeFormat';
import { getCaseStudyTypeVariant } from '../utils/getCaseVariants';
import { getCaseStatusVisual } from '../utils/caseStatus.visuals';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

const TYPE_DISPLAY_LABELS: Record<string, string> = {
  wgts: 'WGTS T-N',
  cttso: 'ctTSO500',
  wgs_n: 'WGS_N',
};

export function CaseDetailsOverviewCard() {
  const { caseDetail, isLoadingCaseDetail } = useCaseDetailsContext();

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-[#111418]'>
      <div className='grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3'>
        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Request Form ID</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-40' />
          ) : (
            <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.requestFormId ?? '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Alias</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-32' />
          ) : (
            <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.alias && caseDetail.alias.length > 0 ? caseDetail.alias.join(', ') : '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Report Required</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-5 w-16' />
          ) : (
            <PillTag variant={caseDetail?.isReportRequired ? 'green' : 'neutral'} size='sm'>
              {caseDetail?.isReportRequired == null
                ? '—'
                : caseDetail.isReportRequired
                  ? 'Yes'
                  : 'No'}
            </PillTag>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Type</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-5 w-24' />
          ) : (
            <PillTag variant='blue' size='sm'>
              {TYPE_DISPLAY_LABELS[caseDetail?.type ?? ''] ?? caseDetail?.type ?? '—'}
            </PillTag>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Status</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-5 w-28' />
          ) : caseDetail?.latestState ? (
            (() => {
              const { variant, label } = getCaseStatusVisual(caseDetail.latestState.status);
              return (
                <PillTag variant={variant} size='sm'>
                  {label}
                </PillTag>
              );
            })()
          ) : (
            <span className='text-sm text-neutral-500 dark:text-neutral-400'>—</span>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>NATA Accredited</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-5 w-16' />
          ) : (
            <PillTag variant={caseDetail?.isNataAccredited ? 'green' : 'neutral'} size='sm'>
              {caseDetail?.isNataAccredited == null
                ? '—'
                : caseDetail.isNataAccredited
                  ? 'Yes'
                  : 'No'}
            </PillTag>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Study Type</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-5 w-24' />
          ) : (
            <PillTag
              variant={
                caseDetail?.studyType ? getCaseStudyTypeVariant(caseDetail.studyType) : 'neutral'
              }
              size='sm'
            >
              {caseDetail?.studyType ?? '—'}
            </PillTag>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Study Name</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-32' />
          ) : (
            <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.studyName ?? '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Study ID</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-28' />
          ) : (
            <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.studyId ?? '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>UR Number</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-28' />
          ) : (
            <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.urNumber ?? '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Due Date</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-28' />
          ) : (
            <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.dueDate ? formatCalendarDate(caseDetail.dueDate) : '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Last Updated</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-36' />
          ) : (
            <div className='text-sm text-neutral-900 dark:text-neutral-100'>
              {caseDetail?.latestState?.createdAt
                ? formatDetailDate(caseDetail.latestState.createdAt)
                : '—'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Links</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-48' />
          ) : caseDetail?.links && Object.keys(caseDetail.links).length > 0 ? (
            <ul className='space-y-1'>
              {Object.entries(caseDetail.links as Record<string, string>).map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:underline dark:text-blue-400'
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className='text-sm text-neutral-500 dark:text-neutral-400'>—</div>
          )}
        </div>

        <div className='sm:col-span-2 xl:col-span-3'>
          <div className='mb-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>Description</div>
          {isLoadingCaseDetail ? (
            <Skeleton className='h-4 w-full' />
          ) : (
            <div className='text-sm text-neutral-700 dark:text-neutral-300'>
              {caseDetail?.description ?? '—'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
