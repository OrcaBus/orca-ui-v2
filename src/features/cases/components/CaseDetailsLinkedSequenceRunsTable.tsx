import { useNavigate } from 'react-router';
import { Dna, Unlink } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { type SequenceRunListModel } from '@/features/runs/shared/api/sequence.api';

interface CaseDetailsLinkedSequenceRunsTableProps {
  runs: SequenceRunListModel[];
  isLoading: boolean;
  emptyDescription: string;
  /** Optional. If omitted it becomes read-only. */
  onUnlink?: (run: SequenceRunListModel) => void;
  unlinkIsPending?: boolean;
}

export function CaseDetailsLinkedSequenceRunsTable({
  runs,
  isLoading,
  emptyDescription,
  onUnlink,
  unlinkIsPending = false,
}: CaseDetailsLinkedSequenceRunsTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, DEFAULT_PAGE_SIZE, runs.length);

  const columns: Column<SequenceRunListModel>[] = [
    {
      key: 'sequenceRunId',
      header: 'Sequence Run ID',
      sortable: true,
      render: (run) => (
        <Button
          variant='ghost'
          size='inline'
          onClick={(e) => {
            e.stopPropagation();
            if (run.instrumentRunId) {
              void navigate(`/runs/sequence-runs/${run.instrumentRunId}`);
            }
          }}
          disabled={!run.instrumentRunId}
          className='cursor-pointer font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:cursor-default disabled:text-neutral-600 disabled:no-underline dark:text-[#137fec] dark:hover:text-blue-400 dark:disabled:text-neutral-400'
        >
          {run.sequenceRunId}
        </Button>
      ),
    },
    {
      key: 'instrumentRunId',
      header: 'Instrument Run ID',
      sortable: true,
      render: (run) => (
        <span className='font-mono text-xs text-neutral-600 dark:text-[#9dabb9]'>
          {run.instrumentRunId ?? '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (run) =>
        run.status ? (
          <StatusBadge status={run.status} />
        ) : (
          <span className='text-neutral-400'>-</span>
        ),
    },
    {
      key: 'startTime',
      header: 'Start Time',
      sortable: true,
      render: (run) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {run.startTime ? formatTableDate(run.startTime) : '-'}
        </span>
      ),
    },
    {
      key: 'endTime',
      header: 'End Time',
      sortable: true,
      render: (run) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {run.endTime ? formatTableDate(run.endTime) : '-'}
        </span>
      ),
    },
    ...(onUnlink
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (run: SequenceRunListModel) => (
              <Button
                variant='ghost'
                size='inline'
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlink(run);
                }}
                disabled={unlinkIsPending}
                aria-label={`Unlink sequence run ${run.sequenceRunId}`}
                className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10'
                title='Unlink sequence run'
              >
                <Unlink className='h-4 w-4' />
              </Button>
            ),
          } satisfies Column<SequenceRunListModel>,
        ]
      : []),
  ];

  if (runs.length === 0 && !isLoading) {
    return (
      <div className='flex min-h-60 items-center justify-center'>
        <EmptyState icon={Dna} title='No sequence runs' description={emptyDescription} />
      </div>
    );
  }

  return (
    <DataTable
      data={runs}
      columns={columns}
      isLoading={isLoading}
      emptyMessage='No sequence runs found.'
      paginationProps={runs.length > DEFAULT_PAGE_SIZE ? pagination : undefined}
    />
  );
}
