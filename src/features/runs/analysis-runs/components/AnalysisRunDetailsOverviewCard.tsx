import { Activity, FlaskConical, Network } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { RelationshipLinkTag } from '@/components/ui/RelationshipLinkTag';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';
import { useAnalysisRunDetailsTab } from '../hooks/useAnalysisRunDetailsTab';

export function AnalysisRunDetailsOverviewCard() {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();
  const { setActiveTab } = useAnalysisRunDetailsTab();

  const ar = analysisRunDetail;
  const analysis = ar?.analysis;

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='flex divide-x divide-neutral-200 dark:divide-neutral-700'>
        {/* Analysis Run Fields */}
        <div className='flex-1 pr-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Activity className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Analysis Run Fields
            </h4>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Analysis Run Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingAnalysisRunDetail ? (
                  <Skeleton className='h-4 w-40' />
                ) : (
                  (ar?.analysisRunName ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Current Status
              </div>
              <div className='text-sm'>
                {isLoadingAnalysisRunDetail ? (
                  <Skeleton className='h-5 w-24 rounded-full' />
                ) : (
                  <StatusBadge status={ar?.currentState?.status ?? 'unknown'} size='sm' />
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Comment</div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingAnalysisRunDetail ? (
                  <Skeleton className='h-4 w-40' />
                ) : (
                  (ar?.comment ?? '—')
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className='flex-1 px-8'>
          <div className='mb-4 flex items-center gap-2'>
            <FlaskConical className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Analysis Details
            </h4>
          </div>
          {isLoadingAnalysisRunDetail ? (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
          ) : analysis ? (
            <div className='space-y-3'>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Name
                </div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysis.analysisName}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Version</div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysis.analysisVersion}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Description
                </div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysis.description ?? '—'}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Status</div>
                <div className='text-sm'>
                  <StatusBadge status={analysis.status ?? 'unknown'} size='sm' />
                </div>
              </div>
            </div>
          ) : (
            <div className='text-sm text-neutral-400 italic'>No analysis details available</div>
          )}
        </div>

        {/* Relationships */}
        <div className='flex-1 pl-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Network className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Relationships
            </h4>
          </div>
          {isLoadingAnalysisRunDetail ? (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-32' />
            </div>
          ) : (
            <div className='space-y-3'>
              {/* Linked Contexts */}
              <div>
                <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Linked Contexts
                </div>
                <div className='flex flex-wrap gap-1'>
                  {ar?.contexts?.length ? (
                    ar.contexts.map((ctx) => (
                      <RelationshipLinkTag
                        key={ctx.orcabusId}
                        color='purple'
                        onClick={() => setActiveTab('run-context')}
                      >
                        {ctx.name}
                      </RelationshipLinkTag>
                    ))
                  ) : (
                    <span className='text-sm text-neutral-400'>—</span>
                  )}
                </div>
              </div>
              {/* Linked Libraries */}
              <div>
                <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Linked Libraries
                </div>
                <div className='flex flex-wrap gap-1'>
                  {ar?.libraries?.length ? (
                    ar.libraries.map((lib) => (
                      <RelationshipLinkTag
                        key={lib.orcabusId}
                        color='green'
                        href={`/lab/libraries/libid/${lib.libraryId}`}
                      >
                        {lib.libraryId}
                      </RelationshipLinkTag>
                    ))
                  ) : (
                    <span className='text-sm text-neutral-400'>—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
