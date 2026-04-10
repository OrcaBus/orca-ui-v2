import { Archive, Ban, CheckCheck, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import type { SequenceStatus } from '../hooks/useSequenceQueryParams';
import type { InstrumentRunStatus } from '../utils/groupByInstrumentRun';
import { useSequenceRunStatsStatusCountsModel } from '../api/sequence.api';
import { useSequenceQueryParams } from '../hooks/useSequenceQueryParams';
import { keepPreviousData } from '@tanstack/react-query';
import { toUtcStartOfDayQueryParam } from '@/utils/timeFormat';

const filledIconProps = { fill: 'currentColor', stroke: 'white', strokeWidth: 1.5 } as const;

function getSequenceStatusIcon(status: InstrumentRunStatus) {
  switch (status) {
    case 'SUCCEEDED':
      return (
        <CheckCircle className='h-5 w-5 text-green-500 dark:text-green-400' {...filledIconProps} />
      );
    case 'FAILED':
      return <XCircle className='h-5 w-5 text-red-500 dark:text-red-400' {...filledIconProps} />;
    case 'STARTED':
      return (
        <PlayCircle className='h-5 w-5 text-amber-500 dark:text-amber-400' {...filledIconProps} />
      );
    case 'ABORTED':
      return <Ban className='h-5 w-5 text-neutral-500 dark:text-[#9dabb9]' {...filledIconProps} />;
    case 'RESOLVED':
      return <CheckCheck className='h-5 w-5 text-blue-500 dark:text-[#137fec]' />;
    case 'DEPRECATED':
      return (
        <Archive className='h-5 w-5 text-purple-500 dark:text-purple-400' {...filledIconProps} />
      );
    default:
      return null;
  }
}

interface SequenceRunsStatusCardsProps {
  statusFilter: SequenceStatus | 'all';
  onStatusCardClick: (status: InstrumentRunStatus) => void;
}

const statusCards: Array<{
  status: InstrumentRunStatus;
  label: string;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { status: 'SUCCEEDED', label: 'Succeeded', variant: 'success' },
  { status: 'FAILED', label: 'Failed', variant: 'error' },
  { status: 'STARTED', label: 'Started', variant: 'warning' },
  { status: 'ABORTED', label: 'Aborted', variant: 'neutral' },
  { status: 'RESOLVED', label: 'Resolved', variant: 'info' },
  { status: 'DEPRECATED', label: 'Deprecated', variant: 'neutral' },
];

export function SequenceRunsStatusCards({
  statusFilter,
  onStatusCardClick,
}: SequenceRunsStatusCardsProps) {
  const { search, dateFrom, dateTo } = useSequenceQueryParams();

  // get sequence run status count
  const {
    data: sequenceRunStatsStatusCountsData,
    isFetching: isFetchingSequenceRunStatsStatusCounts,
    isLoading: isLoadingSequenceRunStatsStatusCounts,
    isError: isErrorSequenceRunStatsStatusCounts,
    error: sequenceRunStatsStatusCountsError,
  } = useSequenceRunStatsStatusCountsModel({
    params: {
      query: {
        search: search ? search : undefined,
        start_time: dateFrom ? toUtcStartOfDayQueryParam(dateFrom) : undefined,
        end_time: dateTo ? toUtcStartOfDayQueryParam(dateTo) : undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  if (isErrorSequenceRunStatsStatusCounts) {
    return <ApiErrorState error={sequenceRunStatsStatusCountsError} className='mb-6' />;
  }

  const counts = {
    all: sequenceRunStatsStatusCountsData?.all ?? 0,
    started: sequenceRunStatsStatusCountsData?.started ?? 0,
    succeeded: sequenceRunStatsStatusCountsData?.succeeded ?? 0,
    failed: sequenceRunStatsStatusCountsData?.failed ?? 0,
    aborted: sequenceRunStatsStatusCountsData?.aborted ?? 0,
    resolved: sequenceRunStatsStatusCountsData?.resolved ?? 0,
    deprecated: sequenceRunStatsStatusCountsData?.deprecated ?? 0,
  };

  const countsByStatus: Record<InstrumentRunStatus, number> = {
    SUCCEEDED: counts.succeeded,
    FAILED: counts.failed,
    STARTED: counts.started,
    ABORTED: counts.aborted,
    RESOLVED: counts.resolved,
    DEPRECATED: counts.deprecated,
  };

  const totalRuns = counts.all;
  const showLoadingCards =
    isFetchingSequenceRunStatsStatusCounts ||
    (isLoadingSequenceRunStatsStatusCounts && !sequenceRunStatsStatusCountsData);

  return (
    <div className='mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6'>
      {showLoadingCards
        ? statusCards.map((card) => <StatusCard key={card.status} label='' value={0} isLoading />)
        : statusCards.map((card) => {
            const count = countsByStatus[card.status];
            const percentage = totalRuns > 0 ? Math.round((count / totalRuns) * 100) : 0;
            return (
              <StatusCard
                key={card.status}
                label={card.label}
                value={count}
                percentage={percentage}
                icon={getSequenceStatusIcon(card.status)}
                variant={card.variant}
                selected={statusFilter !== 'all' && statusFilter === card.status}
                onClick={() => onStatusCardClick(card.status)}
              />
            );
          })}
    </div>
  );
}
