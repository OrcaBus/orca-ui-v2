import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import { useWorkflowRunStatusCountModel } from '../../shared/api/workflows.api';
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

type WorkflowRunsStatusCounts = Record<'all' | WorkflowRunStatus, number>;

function getStatusCount<T extends object>(data: T | null | undefined, key: string): number {
  const value = data == null ? undefined : data[key as keyof T];
  return typeof value === 'number' ? value : 0;
}

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

  const counts: WorkflowRunsStatusCounts = {
    all: getStatusCount(workflowStatusCountsData, 'all'),
    succeeded: getStatusCount(workflowStatusCountsData, 'succeeded'),
    aborted: getStatusCount(workflowStatusCountsData, 'aborted'),
    failed: getStatusCount(workflowStatusCountsData, 'failed'),
    resolved: getStatusCount(workflowStatusCountsData, 'resolved'),
    draft: getStatusCount(workflowStatusCountsData, 'draft'),
    ongoing: getStatusCount(workflowStatusCountsData, 'ongoing'),
    deprecated: getStatusCount(workflowStatusCountsData, 'deprecated'),
    cancelled: getStatusCount(workflowStatusCountsData, 'cancelled'),
  };

  const showLoadingCards = isLoadingWorkflowStatusCounts && !workflowStatusCountsData;
  const total = counts.all;

  return (
    <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-8'>
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
