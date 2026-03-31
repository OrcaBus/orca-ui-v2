import { useNavigate } from 'react-router';
import { FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import type { WorkflowRun } from '../../../data/mockData';

interface LibraryWorkflowRunsTabProps {
  relatedWorkflows: WorkflowRun[];
}

export function LibraryWorkflowRunsTab({ relatedWorkflows }: LibraryWorkflowRunsTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, relatedWorkflows.length);

  const workflowColumns: Column<WorkflowRun>[] = [
    {
      key: 'name',
      header: 'Run Name',
      sortable: true,
      render: (wf) => (
        <button
          onClick={() => void navigate(`/workflows`)}
          className='text-left font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {wf.name}
        </button>
      ),
    },
    {
      key: 'workflowId',
      header: 'Workflow Type',
      sortable: true,
      render: (wf) => (
        <div className='font-mono text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {wf.workflowId}
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
      key: 'startTime',
      header: 'Started',
      sortable: true,
      render: (wf) => (
        <div className='text-sm text-neutral-900 dark:text-white'>
          {new Date(wf.startTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'endTime',
      header: 'Ended/Updated',
      sortable: true,
      render: (wf) => (
        <div className='text-sm text-neutral-900 dark:text-white'>
          {wf.endTime ? new Date(wf.endTime).toLocaleString() : '-'}
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (wf) => (
        <div className='text-sm text-neutral-900 dark:text-white'>{wf.duration || '-'}</div>
      ),
    },
  ];

  if (relatedWorkflows.length === 0) {
    return (
      <div className='rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-[#2d3540] dark:bg-[#111418]'>
        <FileText className='mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
        <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>No workflow runs</h3>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          This library has not been processed by any workflows yet.
        </p>
      </div>
    );
  }

  return (
    <DataTable data={relatedWorkflows} columns={workflowColumns} paginationProps={pagination} />
  );
}
