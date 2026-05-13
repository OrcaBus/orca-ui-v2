import { keepPreviousData } from '@tanstack/react-query';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusCard } from '@/components/ui/StatusCard';
import {
  useAnalysisStatusCountModel,
  type AnalysisStatusCountModel,
} from '../../api/workflows.api';
import { getAnalysisTypeIcon } from '../../shared/utils/statusIcons';
import {
  useAnalysisTypesQueryParams,
  type AnalysisTypeStatus,
} from '../hooks/useAnalysisTypesQueryParams';

interface AnalysisTypesStatusCardsProps {
  status: AnalysisTypeStatus | 'all';
  onStatusCardClick: (status: AnalysisTypeStatus) => void;
}

const statusCards: Array<{
  label: string;
  status: 'ACTIVE' | 'INACTIVE';
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Active', status: 'ACTIVE', variant: 'success' },
  { label: 'Inactive', status: 'INACTIVE', variant: 'neutral' },
];

export function AnalysisTypesStatusCards({
  status,
  onStatusCardClick,
}: AnalysisTypesStatusCardsProps) {
  const { search } = useAnalysisTypesQueryParams();

  const {
    data: analysisStatusCountsData,
    isLoading: isLoadingAnalysisStatusCounts,
    isError: isErrorAnalysisStatusCounts,
    error: analysisStatusCountsError,
  } = useAnalysisStatusCountModel({
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

  if (isErrorAnalysisStatusCounts) {
    return <ApiErrorState error={analysisStatusCountsError} className='mb-4' />;
  }

  const counts: Required<AnalysisStatusCountModel> = {
    all: analysisStatusCountsData?.all ?? 0,
    active: analysisStatusCountsData?.active ?? 0,
    inactive: analysisStatusCountsData?.inactive ?? 0,
  };

  const total = counts.all;

  return (
    <div className='mb-6 grid grid-cols-4 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {isLoadingAnalysisStatusCounts
        ? statusCards.map((card) => <StatusCard key={card.status} label='' value={0} isLoading />)
        : statusCards.map((card) => {
            const count = card.status === 'ACTIVE' ? counts.active : counts.inactive;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <StatusCard
                key={card.status}
                label={card.label}
                value={count}
                percentage={percentage}
                icon={getAnalysisTypeIcon(card.status)}
                variant={card.variant}
                selected={status === card.status}
                onClick={() => onStatusCardClick(card.status)}
              />
            );
          })}
    </div>
  );
}
