import { PageBreadcrumb } from '../../../components/ui/PageBreadcrumb';
import { StatusBadge } from '../../../components/ui/StatusBadge';

type BadgeStatus = 'running' | 'completed' | 'failed' | 'pending';

interface SequenceRunDetailsPageHeaderProps {
  runId: string;
  statusBadge: BadgeStatus;
}

export function SequenceRunDetailsPageHeader({
  runId,
  statusBadge,
}: SequenceRunDetailsPageHeaderProps) {
  return (
    <>
      <PageBreadcrumb items={[{ label: 'Sequence', href: '/sequence' }, { label: runId }]} />
      <div className='mb-6'>
        <div className='mb-1 flex items-center gap-3'>
          <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
            Instrument Run {runId}
          </h1>
          <StatusBadge status={statusBadge} size='md' />
        </div>
      </div>
    </>
  );
}
