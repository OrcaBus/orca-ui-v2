import { Copy, Check } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { WorkflowRunDetail } from '@/data/mockData';

export interface WorkflowRunDetailPageHeaderProps {
  workflowRun: WorkflowRunDetail;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export function WorkflowRunDetailPageHeader({
  workflowRun,
  copiedId,
  onCopy,
}: WorkflowRunDetailPageHeaderProps) {
  return (
    <div className='mb-6'>
      <div className='mb-3 flex items-center gap-3'>
        <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
          {workflowRun.name}
        </h1>
        <StatusBadge status={workflowRun.status} size='md' />
      </div>

      {/* Key Identifiers */}
      <div className='flex items-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Portal Run ID:</span>
          <span className='font-mono text-neutral-900 dark:text-neutral-100'>
            {workflowRun.portalRunId}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Execution ID:</span>
          <span className='font-mono text-neutral-900 dark:text-neutral-100'>
            {workflowRun.executionId}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Orcabus ID:</span>
          <span className='font-mono text-neutral-900 dark:text-neutral-100'>
            {workflowRun.orcabusId}
          </span>
          <button
            onClick={() => onCopy(workflowRun.orcabusId, 'orcabus-id')}
            className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            {copiedId === 'orcabus-id' ? (
              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
            ) : (
              <Copy className='h-4 w-4 text-neutral-400' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
