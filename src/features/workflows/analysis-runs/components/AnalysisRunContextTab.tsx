import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { PillTag } from '@/components/ui/PillTag';
import type { WorkflowRunContext } from '@/data/mockData';

export interface AnalysisRunContextTabProps {
  runContexts: WorkflowRunContext[];
}

export function AnalysisRunContextTab({ runContexts }: AnalysisRunContextTabProps) {
  const pagination = useTablePagination(1, 20, runContexts.length);

  const columns: Column<WorkflowRunContext>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (rc) => (
        <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>{rc.name}</div>
      ),
    },
    {
      key: 'useCase',
      header: 'Use Case',
      sortable: true,
      render: (rc) => <PillTag variant='purple'>{rc.useCase.replace(/_/g, ' ')}</PillTag>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (rc) => (
        <div className='text-sm text-neutral-600 dark:text-neutral-400'>{rc.description}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (rc) => (
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            rc.status === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
          }`}
        >
          {rc.status}
        </span>
      ),
    },
  ];

  return <DataTable data={runContexts} columns={columns} paginationProps={pagination} />;
}
