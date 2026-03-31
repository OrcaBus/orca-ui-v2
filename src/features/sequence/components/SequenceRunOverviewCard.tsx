import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatTableDate } from '../../../utils/timeFormat';

type BadgeStatus = 'running' | 'completed' | 'failed' | 'pending';

interface SequenceRunOverviewCardProps {
  runId: string;
  statusBadge: BadgeStatus;
  startTime: string;
  endTime: string | null;
}

export function SequenceRunOverviewCard({
  runId,
  statusBadge,
  startTime,
  endTime,
}: SequenceRunOverviewCardProps) {
  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
            Instrument Run ID
          </div>
          <div className='font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {runId}
          </div>
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Status</div>
          <StatusBadge status={statusBadge} />
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Start Time</div>
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(startTime)}
          </div>
        </div>
        <div>
          <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>End Time</div>
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {endTime ? formatTableDate(endTime) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
