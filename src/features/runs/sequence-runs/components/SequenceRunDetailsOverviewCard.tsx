import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatTableDate } from '@/utils/timeFormat';
import { useSequenceRunDetailsContext } from '../context/SequenceRunDetailsContext';

export function SequenceRunDetailsOverviewCard() {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();
  const { sequenceRunData, isLoadingSequenceRun, latestSequenceRun } =
    useSequenceRunDetailsContext();

  // Earliest run (first start time) among status-bearing runs
  const firstRun = sequenceRunData
    ?.filter((run) => run.status)
    .reduce(
      (earliest, run) =>
        !earliest || dayjs(run.startTime ?? 0).isBefore(dayjs(earliest.startTime ?? 0))
          ? run
          : earliest,
      null as (typeof sequenceRunData)[number] | null
    );

  const startTime = firstRun?.startTime ?? null;
  const endTime = latestSequenceRun?.endTime ?? null;
  const status = latestSequenceRun?.status ?? null;

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
            Instrument Run ID
          </div>
          <div className='font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {isLoadingSequenceRun ? <Skeleton className='h-4 w-48' /> : (instrumentRunId ?? '—')}
          </div>
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Status</div>
          {isLoadingSequenceRun ? (
            <Skeleton className='h-5 w-20 rounded-full' />
          ) : (
            <StatusBadge status={status} />
          )}
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Start Time</div>
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {isLoadingSequenceRun ? (
              <Skeleton className='h-4 w-36' />
            ) : startTime ? (
              formatTableDate(startTime)
            ) : (
              '-'
            )}
          </div>
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>End Time</div>
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {isLoadingSequenceRun ? (
              <Skeleton className='h-4 w-36' />
            ) : endTime ? (
              formatTableDate(endTime)
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
