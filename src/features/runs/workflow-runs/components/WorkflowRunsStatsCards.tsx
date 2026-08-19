import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import {
  useWorkflowRunStatusCountModel,
  type WorkflowRunStatusCountModel,
} from '../../shared/api/workflows.api';
import { toLocalStartOfDay } from '@/utils/timeFormat';
import { getRunsStatusIcon } from '../../shared/utils/statusIcons';
import { getStatusFamily } from '@/components/ui/status-config';
import {
  useWorkflowRunListQueryParams,
  type WorkflowRunStatus,
} from '../hooks/useWorkflowRunListQueryParams';

interface WorkflowRunsStatsCardsProps {
  status: WorkflowRunStatus | 'all';
  onStatusCardClick: (status: WorkflowRunStatus) => void;
}

const statusCards: Array<{
  label: string;
  status: Exclude<WorkflowRunStatus, 'all'>;
}> = [
  { label: 'Succeeded', status: 'succeeded' },
  { label: 'Failed', status: 'failed' },
  { label: 'Aborted', status: 'aborted' },
  { label: 'Cancelled', status: 'cancelled' },
  { label: 'Resolved', status: 'resolved' },
  { label: 'Deprecated', status: 'deprecated' },
  { label: 'Draft', status: 'draft' },
  { label: 'Ongoing', status: 'ongoing' },
];

export function WorkflowRunsStatsCards({ status, onStatusCardClick }: WorkflowRunsStatsCardsProps) {
  const { search, dateFrom, dateTo, filterValues } = useWorkflowRunListQueryParams();

  const {
    data: workflowStatusCountsData,
    isLoading: isLoadingWorkflowStatusCounts,
    isError: isErrorWorkflowStatusCounts,
    error: workflowStatusCountsError,
  } = useWorkflowRunStatusCountModel({
    params: {
      query: {
        search: search ? search : undefined,
        start_time: dateFrom ? toLocalStartOfDay(dateFrom) : undefined,
        end_time: dateTo ? toLocalStartOfDay(dateTo) : undefined,
        workflow: filterValues.wfType || undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  if (isErrorWorkflowStatusCounts) {
    return <ApiErrorState error={workflowStatusCountsError} className='mb-4' />;
  }

  const counts: Required<WorkflowRunStatusCountModel> = {
    all: workflowStatusCountsData?.all ?? 0,
    succeeded: workflowStatusCountsData?.succeeded ?? 0,
    aborted: workflowStatusCountsData?.aborted ?? 0,
    failed: workflowStatusCountsData?.failed ?? 0,
    resolved: workflowStatusCountsData?.resolved ?? 0,
    draft: workflowStatusCountsData?.draft ?? 0,
    ongoing: workflowStatusCountsData?.ongoing ?? 0,
    deprecated: workflowStatusCountsData?.deprecated ?? 0,
    cancelled: workflowStatusCountsData?.cancelled ?? 0,
  };

  const showLoadingCards = isLoadingWorkflowStatusCounts && !workflowStatusCountsData;
  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-8'>
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
                variant={getStatusFamily(card.status)}
                selected={status === card.status}
                onClick={() => onStatusCardClick(card.status)}
              />
            );
          })}
    </div>
  );
}
