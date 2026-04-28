import { useNavigate } from 'react-router';
import { SimpleTable, SimpleTableColumn } from '@/components/tables/SimpleTable';
import { useWorkflowRunDetailContext } from '../context/WorkflowRunDetailContext';
import type { Readset as WorkflowReadset } from '@/features/workflows/api/workflows.api';

export function WorkflowRunDetailReadsetsTable() {
  const navigate = useNavigate();
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailContext();
  const readsets = workflowRunDetail?.readsets || [];

  const columns: SimpleTableColumn<WorkflowReadset>[] = [
    {
      key: 'rgid',
      header: 'Readset ID',
      render: (rs) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{rs.rgid}</span>
      ),
    },
    {
      key: 'libraryId',
      header: 'RGID',
      render: (rs) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
          {rs.libraryId}
        </span>
      ),
    },
    {
      key: 'libraryOrcabusId',
      header: 'Library ID',
      render: (rs) => (
        <button
          onClick={() => {
            void navigate(`/lab/libraries/${rs.libraryId}`);
          }}
          className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {rs.libraryId}
        </button>
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={readsets}
      emptyMessage='No readsets available'
      isLoading={isLoadingWorkflowRunDetail}
    />
  );
}
