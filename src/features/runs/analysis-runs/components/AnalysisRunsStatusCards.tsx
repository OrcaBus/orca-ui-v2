import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import {
  useAnalysisRunStatusCountModel,
  type AnalysisRunStatusCountModel,
} from '../../shared/api/workflows.api';
import { getRunsStatusIcon } from '../../shared/utils/statusIcons';
import { getStatusFamily } from '@/components/ui/status-config';
import {
  useAnalysisRunsListQueryParams,
  type AnalysisRunStatus,
} from '../hooks/useAnalysisRunsListQueryParams';
import { toLocalStartOfDay } from '@/utils/timeFormat';

interface AnalysisRunsStatusCardsProps {
  status: AnalysisRunStatus | 'all';
  onStatusCardClick: (status: AnalysisRunStatus) => void;
}

const statusCards: Array<{
  label: string;
  status: Exclude<AnalysisRunStatus, 'draft'>;
}> = [
  { label: 'Succeeded', status: 'succeeded' },
  { label: 'Failed', status: 'failed' },
  { label: 'Aborted', status: 'aborted' },
  { label: 'Resolved', status: 'resolved' },
  { label: 'Deprecated', status: 'deprecated' },
  { label: 'Ongoing', status: 'ongoing' },
];

export function AnalysisRunsStatusCards({
  status,
  onStatusCardClick,
}: AnalysisRunsStatusCardsProps) {
  const { search, dateFrom, dateTo, filterValues } = useAnalysisRunsListQueryParams();

  const {
    data: analysisRunStatusCountsData,
    isLoading: isLoadingAnalysisRunStatusCounts,
    isError: isErrorAnalysisRunStatusCounts,
    error: analysisRunStatusCountsError,
  } = useAnalysisRunStatusCountModel({
    params: {
      query: {
        search: search ? search : undefined,
        startTime: dateFrom ? toLocalStartOfDay(dateFrom) : undefined,
        endTime: dateTo ? toLocalStartOfDay(dateTo) : undefined,
        analysis: filterValues.arType || undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  if (isErrorAnalysisRunStatusCounts) {
    return <ApiErrorState error={analysisRunStatusCountsError} className='mb-4' />;
  }

  const counts: Required<AnalysisRunStatusCountModel> = {
    all: analysisRunStatusCountsData?.all ?? 0,
    succeeded: analysisRunStatusCountsData?.succeeded ?? 0,
    aborted: analysisRunStatusCountsData?.aborted ?? 0,
    failed: analysisRunStatusCountsData?.failed ?? 0,
    resolved: analysisRunStatusCountsData?.resolved ?? 0,
    ongoing: analysisRunStatusCountsData?.ongoing ?? 0,
    deprecated: analysisRunStatusCountsData?.deprecated ?? 0,
    cancelled: analysisRunStatusCountsData?.cancelled ?? 0,
  };
  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6'>
      {isLoadingAnalysisRunStatusCounts
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
