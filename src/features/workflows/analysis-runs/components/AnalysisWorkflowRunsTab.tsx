import { useNavigate } from 'react-router';
import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import type { AnalysisWorkflowRun } from '@/data/mockData';

export interface AnalysisWorkflowRunsTabProps {
  workflowRuns: AnalysisWorkflowRun[];
}

export function AnalysisWorkflowRunsTab({ workflowRuns }: AnalysisWorkflowRunsTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, workflowRuns.length);

  const columns: Column<AnalysisWorkflowRun>[] = [
    {
      key: 'name',
      header: 'Run Name',
      sortable: true,
      render: (wf) => (
        <button
          onClick={() => {
            void navigate(`/workflows/workflowrun/${wf.id}`);
          }}
          className='text-left font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {wf.name}
        </button>
      ),
    },
    {
      key: 'portalRunId',
      header: 'Portal Run ID',
      sortable: true,
      render: (wf) => (
        <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
          {wf.portalRunId}
        </div>
      ),
    },
    {
      key: 'executionId',
      header: 'Execution ID',
      sortable: true,
      render: (wf) => (
        <div className='font-mono text-sm text-neutral-600 dark:text-neutral-400'>
          {wf.executionId}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (wf) => <StatusBadge status={wf.status} />,
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      sortable: true,
      render: (wf) => (
        <div className='text-sm text-neutral-600 dark:text-neutral-400'>
          {formatTableDate(wf.lastModified)}
        </div>
      ),
    },
  ];

  return <DataTable data={workflowRuns} columns={columns} paginationProps={pagination} />;
}
