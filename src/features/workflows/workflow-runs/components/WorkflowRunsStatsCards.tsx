import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import { type WorkflowRunStatsStatusCountModel } from '../../api/workflows.api';
import { getRunsStatusIcon } from '../../shared/utils/statusIcons';
import { type WorkflowRunStatus } from '../hooks/useWorkflowRunListQueryParams';

interface WorkflowRunsStatsCardsProps {
  status: WorkflowRunStatus | 'all';
  onStatusCardClick: (status: WorkflowRunStatus) => void;
  workflowStatusCountsData?: WorkflowRunStatsStatusCountModel;
  isLoadingWorkflowStatusCounts: boolean;
  isErrorWorkflowStatusCounts: boolean;
  workflowStatusCountsError: unknown;
  onRetry: () => void;
}

const statusCards: Array<{
  label: string;
  status: Exclude<WorkflowRunStatus, 'all'>;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Succeeded', status: 'succeeded', variant: 'success' },
  { label: 'Failed', status: 'failed', variant: 'error' },
  { label: 'Aborted', status: 'aborted', variant: 'neutral' },
  { label: 'Resolved', status: 'resolved', variant: 'info' },
  { label: 'Deprecated', status: 'deprecated', variant: 'neutral' },
  { label: 'Draft', status: 'draft', variant: 'neutral' },
  { label: 'Ongoing', status: 'ongoing', variant: 'warning' },
];

export function WorkflowRunsStatsCards({
  status,
  onStatusCardClick,
  workflowStatusCountsData,
  isLoadingWorkflowStatusCounts,
  isErrorWorkflowStatusCounts,
  workflowStatusCountsError,
  onRetry,
}: WorkflowRunsStatsCardsProps) {
  if (isErrorWorkflowStatusCounts) {
    return <ApiErrorState error={workflowStatusCountsError} onRetry={onRetry} className='mb-4' />;
  }

  const counts: Required<WorkflowRunStatsStatusCountModel> = {
    all: workflowStatusCountsData?.all ?? 0,
    succeeded: workflowStatusCountsData?.succeeded ?? 0,
    aborted: workflowStatusCountsData?.aborted ?? 0,
    failed: workflowStatusCountsData?.failed ?? 0,
    resolved: workflowStatusCountsData?.resolved ?? 0,
    draft: workflowStatusCountsData?.draft ?? 0,
    ongoing: workflowStatusCountsData?.ongoing ?? 0,
    deprecated: workflowStatusCountsData?.deprecated ?? 0,
  };

  const showLoadingCards = isLoadingWorkflowStatusCounts;
  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7'>
      {showLoadingCards
        ? statusCards.map((card) => <StatusCard key={card.status} label='' value={0} isLoading />)
        : statusCards.map((card) => {
            const count = counts[card.status];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <StatusCard
                key={card.status}
                label={card.label}
                value={count}
                percentage={percentage}
                icon={getRunsStatusIcon(card.status)}
                variant={card.variant}
                selected={status === card.status}
                onClick={() => onStatusCardClick(card.status)}
              />
            );
          })}
    </div>
  );
}
