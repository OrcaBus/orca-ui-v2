import { PillTag } from '@/components/ui/PillTag';
import type { WorkflowRunDetail } from '@/data/mockData';

export interface WorkflowRunOverviewCardProps {
  workflowRun: WorkflowRunDetail;
}

export function WorkflowRunOverviewCard({ workflowRun }: WorkflowRunOverviewCardProps) {
  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='grid grid-cols-3 gap-8'>
        {/* Workflow Run Fields */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Workflow Run
          </h3>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Portal Run ID
              </div>
              <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.portalRunId}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Execution ID
              </div>
              <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.executionId}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Workflow Run Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.name}
              </div>
            </div>
            {workflowRun.comment && (
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Comment</div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {workflowRun.comment}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Workflow Details
          </h3>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Workflow Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.workflow.name}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Version</div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.workflow.version}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Execution Engine
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {workflowRun.workflow.executionEngine}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Validation State
              </div>
              <div className='text-sm'>
                <PillTag
                  variant={workflowRun.workflow.validationState === 'valid' ? 'green' : 'red'}
                >
                  {workflowRun.workflow.validationState}
                </PillTag>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Details (if available) */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Analysis Details
          </h3>
          {workflowRun.analysis ? (
            <div className='space-y-3'>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Run Name
                </div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {workflowRun.analysis.analysisRunName}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                  Analysis Name
                </div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {workflowRun.analysis.analysisName}
                </div>
              </div>
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Version</div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {workflowRun.analysis.analysisVersion}
                </div>
              </div>
              {workflowRun.analysis.description && (
                <div>
                  <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                    Description
                  </div>
                  <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                    {workflowRun.analysis.description}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-sm text-neutral-400 italic'>No analysis details available</div>
          )}
        </div>
      </div>
    </div>
  );
}
