import { useNavigate } from 'react-router';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { PillTag } from '../../../components/ui/PillTag';
import { Eye, Trash2 } from 'lucide-react';
import { getRelativeTime, formatDetailDate } from '../../../utils/timeFormat';
import type { Case } from '../types/case.types';
import { getCaseTypeVariant } from '../utils/getCaseTypeVariant';

interface CasesTableProps {
  data: Case[];
  onViewLinked: (case_: Case) => void;
  onDelete: (case_: Case) => void;
  emptyMessage?: string;
}

export function CasesTable({
  data,
  onViewLinked,
  onDelete,
  emptyMessage = 'No cases found',
}: CasesTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, data.length);

  const columns: Column<Case>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (case_) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              void navigate(`/cases/${case_.id}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {case_.title}
          </button>
        </div>
      ),
    },
    {
      key: 'alias',
      header: 'Alias',
      sortable: true,
      render: (case_) => (
        <div className='font-mono text-sm text-neutral-700 dark:text-neutral-300'>
          {case_.alias}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (case_) => (
        <div
          className='max-w-md truncate text-sm text-neutral-600 dark:text-neutral-400'
          title={case_.description}
        >
          {case_.description}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (case_) => (
        <PillTag variant={getCaseTypeVariant(case_.type)} size='sm'>
          {case_.type}
        </PillTag>
      ),
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      sortable: true,
      render: (case_) => (
        <div
          className='text-sm text-neutral-700 dark:text-neutral-300'
          title={formatDetailDate(case_.lastModified)}
        >
          {getRelativeTime(case_.lastModified)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (case_) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewLinked(case_);
            }}
            className='rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
            title='View linked data'
          >
            <Eye className='h-4 w-4' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(case_);
            }}
            className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
            title='Delete case'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      emptyMessage={emptyMessage}
      paginationProps={pagination}
    />
  );
}
