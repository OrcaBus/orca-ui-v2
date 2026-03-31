import { useNavigate } from 'react-router';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatTableDate } from '../../../utils/timeFormat';
import type { WorkflowRun } from '../../../data/mockData';
import type { Library } from '../../../data/mockData';

interface SequenceWorkflowRunsTabProps {
  workflows: WorkflowRun[];
  libraries: Library[];
  isAvailable: boolean;
}

export function SequenceWorkflowRunsTab({
  workflows,
  libraries,
  isAvailable,
}: SequenceWorkflowRunsTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, workflows.length);

  const columns: Column<WorkflowRun>[] = [
    {
      key: 'name',
      header: 'Run Name',
      sortable: true,
      render: (workflow) => (
        <button
          onClick={() => void navigate(`/workflows/${workflow.id}`)}
          className='text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {workflow.name}
        </button>
      ),
    },
    {
      key: 'workflowType',
      header: 'Workflow Type',
      sortable: true,
      render: (workflow) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {workflow.workflowType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (workflow) => <StatusBadge status={workflow.status} size='sm' />,
    },
    {
      key: 'startTime',
      header: 'Started',
      sortable: true,
      render: (workflow) => (
        <span className='text-sm text-neutral-600 dark:text-neutral-400'>
          {formatTableDate(workflow.startTime)}
        </span>
      ),
    },
    {
      key: 'endTime',
      header: 'Ended / Updated',
      sortable: true,
      render: (workflow) => (
        <span className='text-sm text-neutral-600 dark:text-neutral-400'>
          {workflow.endTime ? formatTableDate(workflow.endTime) : '-'}
        </span>
      ),
    },
    {
      key: 'libraryId',
      header: 'Related Library',
      render: (workflow) => {
        const library = libraries.find((lib) => lib.id === workflow.libraryId);
        return library ? (
          <button
            onClick={() => void navigate(`/lab/${library.id}`)}
            className='font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {library.name}
          </button>
        ) : (
          <span className='text-sm text-neutral-400'>-</span>
        );
      },
    },
  ];

  if (!isAvailable) {
    return (
      <div className='rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900'>
        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
          Workflow runs are available after a successful sequence run.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={workflows}
      emptyMessage='No workflow runs found for this instrument run'
      paginationProps={pagination}
    />
  );
}
