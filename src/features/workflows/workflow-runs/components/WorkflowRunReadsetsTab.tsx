import { useNavigate } from 'react-router';
import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { WorkflowReadset } from '@/data/mockData';

export interface WorkflowRunReadsetsTabProps {
  readsets: WorkflowReadset[];
}

export function WorkflowRunReadsetsTab({ readsets }: WorkflowRunReadsetsTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, readsets.length);

  const columns: Column<WorkflowReadset>[] = [
    {
      key: 'id',
      header: 'Readset ID',
      sortable: true,
      render: (rs) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{rs.id}</span>
      ),
    },
    {
      key: 'rgid',
      header: 'RGID',
      sortable: true,
      render: (rs) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{rs.rgid}</span>
      ),
    },
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      render: (rs) => (
        <button
          onClick={() => {
            void navigate(`/lab/${rs.libraryId}`);
          }}
          className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {rs.libraryId}
        </button>
      ),
    },
    {
      key: 'readsetOrcabusId',
      header: 'Readset Orcabus ID',
      sortable: true,
      render: (rs) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {rs.readsetOrcabusId}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (rs) =>
        rs.status ? (
          <StatusBadge status={rs.status} />
        ) : (
          <span className='text-sm text-neutral-400'>-</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={readsets}
      emptyMessage='No readsets available'
      paginationProps={pagination}
    />
  );
}
