import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useLastPresent } from '@/hooks/useLastPresent';
import { formatTableDate } from '@/utils/timeFormat';
import { useDeployStatusStackEvents, type DeployStatusEvent } from '../api/deploy-status.api';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';

interface StackEventsDrawerProps {
  stackId: string | null;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onClose: () => void;
}

function formatCommitId(commitId?: string): string {
  const value = commitId?.trim();
  if (!value) return '—';
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

export function StackEventsDrawer({
  stackId,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onClose,
}: StackEventsDrawerProps) {
  const shownStackId = useLastPresent(stackId);
  const { data, isLoading, isError, error, refetch } = useDeployStatusStackEvents({
    params: {
      path: { stack_id: stackId ?? '' },
      query: { page, rowsPerPage },
    },
    reactQuery: { enabled: Boolean(stackId) },
  });
  const stackName = data?.results[0]?.stackName;

  const columns = useMemo<Column<DeployStatusEvent>[]>(
    () => [
      {
        key: 'status',
        header: 'Status',
        render: (event) => <DeploymentStatusBadge status={event.status} />,
      },
      {
        key: 'modificationTimestamp',
        header: 'Timestamp',
        render: (event) => (
          <span className='text-sm whitespace-nowrap text-neutral-700 dark:text-neutral-300'>
            {formatTableDate(event.modificationTimestamp)}
          </span>
        ),
      },
      {
        key: 'gitCommitId',
        header: 'Version',
        render: (event) => (
          <code
            className='font-mono text-xs text-neutral-700 dark:text-neutral-300'
            title={event.gitCommitId}
          >
            {formatCommitId(event.gitCommitId)}
          </code>
        ),
      },
      {
        key: 'eventId',
        header: 'CloudFormation Event ID',
        copyable: true,
        render: (event) => (
          <code className='font-mono text-xs text-neutral-600 dark:text-neutral-400'>
            {event.eventId}
          </code>
        ),
      },
      {
        key: 'orcabusId',
        header: 'OrcaBus Event ID',
        copyable: true,
        render: (event) => (
          <code className='font-mono text-xs text-neutral-600 dark:text-neutral-400'>
            {event.orcabusId}
          </code>
        ),
      },
    ],
    []
  );

  return (
    <DrawerFrame
      isOpen={Boolean(stackId)}
      onClose={onClose}
      title={stackName ?? 'Deployment events'}
      subtitle={
        shownStackId ? <span className='font-mono text-xs'>{shownStackId}</span> : undefined
      }
      icon={<Activity className='h-5 w-5' aria-hidden='true' />}
      size='full'
      closeLabel='Close stack deployment events'
    >
      {shownStackId ? (
        <section>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
                Deployment events
              </h3>
              <p className='mt-0.5 text-xs text-neutral-500 dark:text-neutral-400'>
                CloudFormation history, newest event first.
              </p>
            </div>
          </div>

          {isError ? (
            <ApiErrorState
              title='Unable to load deployment events'
              error={error}
              onRetry={() => void refetch()}
            />
          ) : (
            <DataTable
              data={data?.results ?? []}
              columns={columns}
              isLoading={isLoading}
              loadingRows={rowsPerPage > 8 ? 8 : rowsPerPage}
              onRefresh={() => void refetch()}
              emptyMessage='No deployment events found for this stack.'
              inCard
              paginationProps={{
                page: data?.pagination.page ?? page,
                pageSize: data?.pagination.rowsPerPage ?? rowsPerPage,
                totalItems: data?.pagination.count ?? 0,
                onPageChange,
                onPageSizeChange: onRowsPerPageChange,
              }}
              persistSettings={{ key: 'tools.deployment-pulse.events' }}
            />
          )}
        </section>
      ) : null}
    </DrawerFrame>
  );
}
