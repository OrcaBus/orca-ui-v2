import { useNavigate } from 'react-router';
import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { PillTag } from '@/components/ui/PillTag';
import { formatTableDate } from '@/utils/timeFormat';
import type { WorkflowLibraryAssociation } from '@/data/mockData';

export interface WorkflowRunLibrariesTabProps {
  libraries: WorkflowLibraryAssociation[];
}

export function WorkflowRunLibrariesTab({ libraries }: WorkflowRunLibrariesTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, libraries.length);

  const columns: Column<WorkflowLibraryAssociation>[] = [
    {
      key: 'libraryName',
      header: 'Library ID',
      sortable: true,
      render: (lib) => (
        <button
          onClick={() => void navigate(`/lab/${lib.libraryId}`)}
          className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {lib.libraryName}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type/Assay',
      sortable: true,
      render: (lib) => (
        <div className='text-sm'>
          {lib.type && <PillTag variant='blue'>{lib.type}</PillTag>}
          {lib.assay && (
            <div className='mt-1 text-xs text-neutral-600 dark:text-neutral-400'>{lib.assay}</div>
          )}
        </div>
      ),
    },
    {
      key: 'associationStatus',
      header: 'Association Status',
      sortable: true,
      render: (lib) => (
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            lib.associationStatus === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
          }`}
        >
          {lib.associationStatus}
        </span>
      ),
    },
    {
      key: 'associationDate',
      header: 'Association Date',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-600 dark:text-neutral-400'>
          {formatTableDate(lib.associationDate)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={libraries}
      emptyMessage='No libraries associated with this workflow run'
      paginationProps={pagination}
    />
  );
}
