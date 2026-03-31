import { useNavigate } from 'react-router';
import { Copy, Check } from 'lucide-react';
import { DataTable, Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { WorkflowReadset } from '@/data/mockData';

export interface AnalysisReadsetsTabProps {
  readsets: WorkflowReadset[];
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export function AnalysisReadsetsTab({ readsets, copiedId, onCopy }: AnalysisReadsetsTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, readsets.length);

  const columns: Column<WorkflowReadset>[] = [
    {
      key: 'rgid',
      header: 'RGID',
      sortable: true,
      render: (rs) => (
        <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{rs.rgid}</div>
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
          className='font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
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
        <div className='flex items-center gap-2'>
          <div className='font-mono text-sm text-neutral-600 dark:text-neutral-400'>
            {rs.readsetOrcabusId}
          </div>
          <button
            type='button'
            onClick={() => onCopy(rs.readsetOrcabusId, `readset-${rs.id}`)}
            className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            {copiedId === `readset-${rs.id}` ? (
              <Check className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
            ) : (
              <Copy className='h-3.5 w-3.5 text-neutral-400' />
            )}
          </button>
        </div>
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

  return <DataTable data={readsets} columns={columns} paginationProps={pagination} />;
}
