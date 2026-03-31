import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PillTag } from '@/components/ui/PillTag';
import type { WorkflowRunContext } from '@/data/mockData';

export interface WorkflowRunRunContextTabProps {
  runContexts: WorkflowRunContext[];
}

export function WorkflowRunRunContextTab({ runContexts }: WorkflowRunRunContextTabProps) {
  const pagination = useTablePagination(1, 20, runContexts.length);

  const columns: Column<WorkflowRunContext>[] = [
    {
      key: 'contextId',
      header: 'Context ID',
      sortable: true,
      render: (ctx) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{ctx.id}</span>
      ),
    },
    {
      key: 'useCase',
      header: 'Use Case',
      sortable: true,
      render: (ctx) => <PillTag variant='blue'>{ctx.useCase}</PillTag>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (ctx) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {ctx.description || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (ctx) => <StatusBadge status={ctx.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={runContexts}
      emptyMessage='No run context data available'
      paginationProps={pagination}
    />
  );
}
