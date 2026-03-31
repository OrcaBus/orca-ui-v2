import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { formatTableDate } from '../../../utils/timeFormat';
import type { Library, WorkflowRun } from '../api/cases.api';

interface WorkflowRunsTableProps {
  allWorkflowRuns: WorkflowRun[];
  libraries: Library[];
  manualCount: number;
  onAddWorkflowRuns: () => void;
}

export function WorkflowRunsTable({
  allWorkflowRuns,
  libraries,
  manualCount,
  onAddWorkflowRuns,
}: WorkflowRunsTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, allWorkflowRuns.length);

  const columns: Column<WorkflowRun>[] = [
    {
      key: 'name',
      header: 'Run Name',
      sortable: true,
      render: (run) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/workflows/${run.id}`);
          }}
          className='text-blue-600 hover:underline dark:text-blue-400'
        >
          {run.name}
        </button>
      ),
    },
    {
      key: 'workflowType',
      header: 'Workflow Type',
      sortable: true,
      render: (run) => (
        <PillTag variant='purple' size='sm'>
          {run.workflowType}
        </PillTag>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (run) => (
        <PillTag
          variant={
            run.status === 'succeeded'
              ? 'green'
              : run.status === 'ongoing'
                ? 'blue'
                : run.status === 'failed'
                  ? 'red'
                  : 'amber'
          }
          size='sm'
        >
          {run.status}
        </PillTag>
      ),
    },
    {
      key: 'startTime',
      header: 'Started',
      sortable: true,
      render: (run) => (
        <span className='text-neutral-600 dark:text-[#9dabb9]'>
          {formatTableDate(run.startTime)}
        </span>
      ),
    },
    {
      key: 'endTime',
      header: 'Ended',
      sortable: true,
      render: (run) => (
        <span className='text-neutral-600 dark:text-[#9dabb9]'>
          {run.endTime ? formatTableDate(run.endTime) : '—'}
        </span>
      ),
    },
    {
      key: 'relatedLibrary',
      header: 'Related Library',
      render: (run) => {
        const lib = libraries.find((l) => l.id === run.libraryId);
        return lib ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              void navigate(`/lab/${lib.id}`);
            }}
            className='font-mono text-xs text-blue-600 hover:underline dark:text-blue-400'
          >
            {lib.name}
          </button>
        ) : (
          <span className='text-xs text-neutral-500 dark:text-[#9dabb9]'>—</span>
        );
      },
    },
  ];

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Workflow Runs
          </h3>
          <p className='mt-1 text-xs text-neutral-500 dark:text-[#9dabb9]'>
            Showing runs from linked libraries
            {manualCount > 0 && ` + ${manualCount} manually added`}
          </p>
        </div>
        <button
          onClick={onAddWorkflowRuns}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        >
          <Plus className='h-4 w-4' />
          Add Workflow Runs
        </button>
      </div>
      <DataTable
        data={allWorkflowRuns}
        columns={columns}
        emptyMessage='No workflow runs available. Link libraries to see their workflow runs.'
        paginationProps={pagination}
      />
    </div>
  );
}
