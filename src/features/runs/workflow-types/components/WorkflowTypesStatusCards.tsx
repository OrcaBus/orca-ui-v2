import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import {
  useGroupedWorkflowStatusCountModel,
  type WorkflowStatusCountModel,
} from '../../api/workflows.api';
import { getValidationStateIcon } from '../../shared/utils/statusIcons';
import {
  useWorkflowTypesListQueryParams,
  type ValidationState,
} from '../hooks/useWorkflowTypesListQueryParams';

interface WorkflowTypesStatusCardsProps {
  status: ValidationState | 'all';
  onStatusCardClick: (status: ValidationState) => void;
}

const statusCards: Array<{
  label: string;
  status: ValidationState;
  countKey: keyof WorkflowStatusCountModel;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Validated', status: 'VALIDATED', countKey: 'validated', variant: 'success' },
  { label: 'Unvalidated', status: 'UNVALIDATED', countKey: 'unvalidated', variant: 'warning' },
  { label: 'Deprecated', status: 'DEPRECATED', countKey: 'deprecated', variant: 'neutral' },
  { label: 'Failed', status: 'FAILED', countKey: 'failed', variant: 'error' },
];

export function WorkflowTypesStatusCards({
  status,
  onStatusCardClick,
}: WorkflowTypesStatusCardsProps) {
  const { search } = useWorkflowTypesListQueryParams();

  const {
    data: workflowStatusCountsData,
    isLoading: isLoadingWorkflowStatusCounts,
    isError: isErrorWorkflowStatusCounts,
    error: workflowStatusCountsError,
  } = useGroupedWorkflowStatusCountModel({
    params: {
      query: {
        search: search ? search : undefined,
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

  const counts: Required<WorkflowStatusCountModel> = {
    all: workflowStatusCountsData?.all ?? 0,
    validated: workflowStatusCountsData?.validated ?? 0,
    unvalidated: workflowStatusCountsData?.unvalidated ?? 0,
    deprecated: workflowStatusCountsData?.deprecated ?? 0,
    failed: workflowStatusCountsData?.failed ?? 0,
  };

  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
      {isLoadingWorkflowStatusCounts
        ? statusCards.map((card) => <StatusCard key={card.status} label='' value={0} isLoading />)
        : statusCards.map((card) => {
            const count = counts[card.countKey];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <StatusCard
                key={card.status}
                label={card.label}
                value={count}
                percentage={percentage}
                icon={getValidationStateIcon(card.status.toLowerCase())}
                variant={card.variant}
                selected={status === card.status}
                onClick={() => onStatusCardClick(card.status)}
              />
            );
          })}
    </div>
  );
}
