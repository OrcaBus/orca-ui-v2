import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router';
import { FileSearch, Unlink } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { type WorkflowRunListModel } from '@/features/runs/shared/api/workflows.api';

interface CaseDetailsLinkedWorkflowRunsTableProps {
  runs: WorkflowRunListModel[];
  isLoading: boolean;
  emptyDescription: string;
  onViewFiles: (portalRunId: string) => void;
  /** Optional unlink affordance. When omitted, no unlink control is rendered (read-only). */
  onUnlink?: (run: WorkflowRunListModel) => void;
  unlinkIsPending?: boolean;
}

export function CaseDetailsLinkedWorkflowRunsTable({
  runs,
  isLoading,
  emptyDescription,
  onViewFiles,
  onUnlink,
  unlinkIsPending = false,
}: CaseDetailsLinkedWorkflowRunsTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, DEFAULT_PAGE_SIZE, runs.length);

  const columns: Column<WorkflowRunListModel>[] = [
    {
      key: 'workflowRunName',
      header: 'Run Name',
      sortable: true,
      render: (run) => (
        <Button
          variant='ghost'
          size='inline'
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/runs/workflow-runs/${run.orcabusId}`);
          }}
          className='cursor-pointer font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
        >
          {run.workflowRunName ?? run.portalRunId}
        </Button>
      ),
    },
    {
      key: 'currentState',
      header: 'Status',
      sortable: true,
      render: (run) =>
        run.currentState ? (
          <StatusBadge status={run.currentState.status} />
        ) : (
          <span className='text-neutral-400'>-</span>
        ),
    },
    {
      key: 'portalRunId',
      header: 'Portal Run ID',
      sortable: true,
      render: (run) => (
        <Button
          variant='ghost'
          size='inline'
          onClick={(e) => {
            e.stopPropagation();
            onViewFiles(run.portalRunId);
          }}
          className='font-mono text-xs text-blue-600 hover:underline dark:text-[#137fec]'
          title='View files for this run'
        >
          {run.portalRunId}
        </Button>
      ),
    },
    {
      key: 'timestamp',
      header: 'Last Updated',
      sortable: true,
      render: (run) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {run.currentState ? formatTableDate(run.currentState.timestamp) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (run) => (
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='inline'
            onClick={(e) => {
              e.stopPropagation();
              onViewFiles(run.portalRunId);
            }}
            aria-label={`View files for workflow run ${run.workflowRunName ?? run.portalRunId}`}
            className='rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-[#9dabb9] dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
            title='View files'
          >
            <FileSearch className='h-4 w-4' />
          </Button>
          {onUnlink && (
            <Button
              variant='ghost'
              size='inline'
              onClick={(e) => {
                e.stopPropagation();
                onUnlink(run);
              }}
              disabled={unlinkIsPending}
              aria-label={`Unlink workflow run ${run.workflowRunName ?? run.portalRunId}`}
              className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10'
              title='Unlink workflow run'
            >
              <Unlink className='h-4 w-4' />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (runs.length === 0 && !isLoading) {
    return (
      <div className='flex min-h-60 items-center justify-center'>
        <EmptyState icon={FileSearch} title='No workflow runs' description={emptyDescription} />
      </div>
    );
  }

  return (
    <DataTable
      data={runs}
      columns={columns}
      isLoading={isLoading}
      emptyMessage='No workflow runs found.'
      paginationProps={runs.length > DEFAULT_PAGE_SIZE ? pagination : undefined}
    />
  );
}
