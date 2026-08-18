import { Activity, GitBranch, BarChart2 } from 'lucide-react';
import { Link } from 'react-router';
import { PillTag } from '@/components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCaseExternalEntityDetailModel } from '@/features/cases/api/cases.api';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';

export function WorkflowRunDetailsOverviewCard() {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();

  const wf = workflowRunDetail;
  const analysisRun = wf?.analysisRun;

  // Workflow runs don't carry a case reference on their own detail payload
  // (see api/types/workflow.openapi.d.ts WorkflowRunDetail) — the link only
  // exists on the Case side, as an external-entity reference. The generic
  // external-entity endpoint gives the reverse lookup: fetch the entity
  // record keyed by *this workflow run's own* orcabusId, and read back
  // whichever case(s) reference it. A workflow run with no case link is the
  // common case, not an error, so a failed/empty lookup just means the
  // "Linked Case" field doesn't render — it isn't surfaced as ApiErrorState.
  const { data: linkedEntity } = useCaseExternalEntityDetailModel({
    params: { path: { orcabusId: wf?.orcabusId ?? '' } },
    reactQuery: { enabled: Boolean(wf?.orcabusId), retry: false },
  });
  const linkedCase = linkedEntity?.case?.[0]?.case;

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='flex divide-x divide-neutral-200 dark:divide-neutral-700'>
        {/* Workflow Run Fields */}
        <div className='flex-1 pr-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Activity className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Workflow Run Fields
            </h4>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Portal Run ID
              </div>
              <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-48' />
                ) : (
                  (wf?.portalRunId ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Execution ID
              </div>
              <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-48' />
                ) : (
                  (wf?.executionId ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Current Status
              </div>
              <div className='text-sm'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-5 w-24 rounded-full' />
                ) : (
                  <StatusBadge status={wf?.currentState?.status ?? 'unknown'} size='sm' />
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Comment</div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-40' />
                ) : (
                  (wf?.comment ?? '—')
                )}
              </div>
            </div>
            {linkedCase && (
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Linked Case
                </div>
                <div className='text-sm'>
                  <Link
                    to={`/cases/${linkedCase.orcabusId}`}
                    className='text-primary hover:underline'
                  >
                    {linkedCase.requestFormId}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <div className='flex-1 px-8'>
          <div className='mb-4 flex items-center gap-2'>
            <GitBranch className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Workflow Details
            </h4>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Workflow Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-32' />
                ) : (
                  (wf?.workflow?.name ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Version</div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-20' />
                ) : (
                  (wf?.workflow?.version ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Execution Engine
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-4 w-24' />
                ) : (
                  (wf?.workflow?.executionEngine ?? '—')
                )}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Validation State
              </div>
              <div className='text-sm'>
                {isLoadingWorkflowRunDetail ? (
                  <Skeleton className='h-5 w-20 rounded-full' />
                ) : (
                  <PillTag
                    variant={wf?.workflow?.validationState === 'VALIDATED' ? 'green' : 'red'}
                  >
                    {wf?.workflow?.validationState ?? '—'}
                  </PillTag>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Run Details */}
        <div className='flex-1 pl-8'>
          <div className='mb-4 flex items-center gap-2'>
            <BarChart2 className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Analysis Run Details
            </h4>
          </div>
          {isLoadingWorkflowRunDetail ? (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
          ) : analysisRun ? (
            <div className='space-y-3'>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Run Name
                </div>
                <div className='text-sm'>
                  <Link
                    to={`/runs/analysis-runs/${analysisRun.orcabusId}`}
                    className='text-primary hover:underline'
                  >
                    {analysisRun.analysisRunName}
                  </Link>
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Run Status
                </div>
                <div className='text-sm'>
                  <StatusBadge status={analysisRun.currentState?.status ?? 'unknown'} size='sm' />
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Name
                </div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysisRun.analysis?.analysisName ?? '—'}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Version</div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysisRun.analysis?.analysisVersion ?? '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className='text-sm text-neutral-400 italic'>No analysis details available</div>
          )}
        </div>
      </div>
    </div>
  );
}
