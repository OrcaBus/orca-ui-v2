import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import {
  useWorkflowRunStatusCountModel,
  type WorkflowRunStatsCountByStatusModel,
} from '../../api/workflows.api';
import { getRunsStatusIcon } from '../../shared/utils/statusIcons';
import {
  useWorkflowRunsQueryParams,
  type WorkflowRunStatus,
} from '../hooks/useWorkflowRunsQueryParams';
import { toUtcStartOfDayQueryParam } from '@/utils/timeFormat';

interface WorkflowRunsStatusCardsProps {
  status: WorkflowRunStatus | 'all';
  onStatusCardClick: (status: WorkflowRunStatus) => void;
}

const statusCards: Array<{
  label: string;
  status: Exclude<WorkflowRunStatus, 'draft'>;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Succeeded', status: 'succeeded', variant: 'success' },
  { label: 'Failed', status: 'failed', variant: 'error' },
  { label: 'Aborted', status: 'aborted', variant: 'neutral' },
  { label: 'Resolved', status: 'resolved', variant: 'info' },
  { label: 'Deprecated', status: 'deprecated', variant: 'neutral' },
  { label: 'Ongoing', status: 'ongoing', variant: 'warning' },
];

export function WorkflowRunsStatusCards({
  status,
  onStatusCardClick,
}: WorkflowRunsStatusCardsProps) {
  const { search, dateFrom, dateTo, filterValues } = useWorkflowRunsQueryParams();

  const {
    data: workflowStatusCountsData,
    isLoading: isLoadingWorkflowStatusCounts,
    isFetching: isFetchingWorkflowStatusCounts,
    isError: isErrorWorkflowStatusCounts,
    error: workflowStatusCountsError,
  } = useWorkflowRunStatusCountModel({
    params: {
      query: {
        search: search ? search : undefined,
        start_time: dateFrom ? toUtcStartOfDayQueryParam(dateFrom) : undefined,
        end_time: dateTo ? toUtcStartOfDayQueryParam(dateTo) : undefined,
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

  const counts: Required<WorkflowRunStatsCountByStatusModel> = {
    all: workflowStatusCountsData?.all ?? 0,
    succeeded: workflowStatusCountsData?.succeeded ?? 0,
    aborted: workflowStatusCountsData?.aborted ?? 0,
    failed: workflowStatusCountsData?.failed ?? 0,
    resolved: workflowStatusCountsData?.resolved ?? 0,
    ongoing: workflowStatusCountsData?.ongoing ?? 0,
    deprecated: workflowStatusCountsData?.deprecated ?? 0,
  };

  const showLoadingCards = isFetchingWorkflowStatusCounts || isLoadingWorkflowStatusCounts;
  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6'>
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
