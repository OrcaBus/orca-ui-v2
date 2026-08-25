import { Activity, GitBranch, Network } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { useCaseExternalEntityDetailModel } from '@/features/cases/api/cases.api';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';
import {
  useWorkflowRunDetailsTab,
  WorkflowRunDetailsTabValues,
} from '../hooks/useWorkflowRunDetailsTab';

export function WorkflowRunDetailsOverviewCard() {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();
  const { setActiveTab } = useWorkflowRunDetailsTab();

  const wf = workflowRunDetail;
  const analysisRun = wf?.analysisRun;
  const libraries = wf?.libraries ?? [];
  const contexts = wf?.contexts ?? [];
  const readsets = wf?.readsets ?? [];

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

  const hasRelationships = Boolean(
    linkedCase || analysisRun || libraries.length || contexts.length || readsets.length
  );

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

        {/* Relationships */}
        <div className='flex-1 pl-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Network className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
            <h4 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400'>
              Relationships
            </h4>
          </div>
          {isLoadingWorkflowRunDetail ? (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
          ) : hasRelationships ? (
            <div className='space-y-3'>
              {/* Linked Case — reverse lookup from the Case side, see above */}
              {linkedCase && (
                <div>
                  <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Linked Case
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    <PillTag variant='neutral' href={`/cases/${linkedCase.orcabusId}`}>
                      {linkedCase.requestFormId}
                    </PillTag>
                  </div>
                </div>
              )}
              {/* Linked Analysis Run — the run's own details live in the tooltip */}
              {analysisRun && (
                <div>
                  <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Linked Analysis Run
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    <Tooltip>
                      {/* PillTag doesn't forward refs/handlers, so the span is the trigger */}
                      <TooltipTrigger asChild>
                        <span className='inline-flex'>
                          <PillTag
                            variant='blue'
                            href={`/runs/analysis-runs/${analysisRun.orcabusId}`}
                          >
                            {analysisRun.analysisRunName}
                          </PillTag>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side='top' align='start' variant='light' size='md'>
                        <div className='space-y-2.5'>
                          <div className='text-xs font-medium break-all text-neutral-900 dark:text-neutral-100'>
                            {analysisRun.analysisRunName}
                          </div>
                          <div className='grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5'>
                            <span className='text-caption text-neutral-500 dark:text-neutral-400'>
                              Analysis Run Status
                            </span>
                            <span>
                              <StatusBadge
                                status={analysisRun.currentState?.status ?? 'unknown'}
                                size='sm'
                              />
                            </span>
                            <span className='text-caption text-neutral-500 dark:text-neutral-400'>
                              Analysis Name
                            </span>
                            <span className='text-caption text-neutral-700 dark:text-neutral-200'>
                              {analysisRun.analysis?.analysisName ?? '—'}
                            </span>
                            <span className='text-caption text-neutral-500 dark:text-neutral-400'>
                              Analysis Version
                            </span>
                            <span className='text-caption text-neutral-700 dark:text-neutral-200'>
                              {analysisRun.analysis?.analysisVersion ?? '—'}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
              {/* Linked Libraries */}
              {libraries.length > 0 && (
                <div>
                  <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Linked Libraries
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {libraries.map((lib) => (
                      <PillTag
                        key={lib.orcabusId}
                        variant='green'
                        href={`/lab/libraries/${lib.orcabusId}`}
                      >
                        {lib.libraryId}
                      </PillTag>
                    ))}
                  </div>
                </div>
              )}
              {/* Run Contexts */}
              {contexts.length > 0 && (
                <div>
                  <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Run Contexts
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {contexts.map((ctx) => (
                      <PillTag
                        key={ctx.orcabusId}
                        variant='purple'
                        onClick={() => setActiveTab(WorkflowRunDetailsTabValues.RunContext)}
                      >
                        {ctx.name}
                      </PillTag>
                    ))}
                  </div>
                </div>
              )}
              {/* Readsets */}
              {readsets.length > 0 && (
                <div>
                  <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Readsets
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {readsets.map((rs) => (
                      <PillTag
                        key={rs.orcabusId}
                        variant='amber'
                        onClick={() => setActiveTab(WorkflowRunDetailsTabValues.Readsets)}
                      >
                        <span className='block max-w-[14rem] truncate font-mono'>{rs.rgid}</span>
                      </PillTag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-sm text-neutral-400 italic'>No relationships found</div>
          )}
        </div>
      </div>
    </div>
  );
}
