import { PillTag } from '@/components/ui/PillTag';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';

export interface LibraryHistoryRecord {
  historyId: string;
  projectSet: string;
  orcabusId: string;
  libraryId: string;
  phenotype: string;
  workflow: string;
  quality: number;
  type: string;
  assay: string;
  coverage: number;
  overrideCycles: string;
  historyUserId: string;
  historyDate: string;
  historyChangeReason: string;
  historyType: 'INSERT' | 'UPDATE' | 'DELETE';
  sample: string;
  subject: string;
}

interface LibraryHistoryTabProps {
  history: LibraryHistoryRecord[];
}

export function LibraryHistoryTab({ history }: LibraryHistoryTabProps) {
  const pagination = useTablePagination(1, 20, history.length);

  const historyColumns: Column<LibraryHistoryRecord>[] = [
    {
      key: 'historyId',
      header: 'History ID',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{h.historyId}</span>
      ),
    },
    {
      key: 'projectSet',
      header: 'Project Set',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{h.projectSet}</span>
      ),
    },
    {
      key: 'orcabusId',
      header: 'Orcabus ID',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-xs text-neutral-700 dark:text-[#9dabb9]'>
          {h.orcabusId}
        </span>
      ),
    },
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{h.libraryId}</span>
      ),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 capitalize dark:text-white'>{h.phenotype}</span>
      ),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      render: (h) => <span className='text-sm text-neutral-900 dark:text-white'>{h.workflow}</span>,
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{h.quality.toFixed(1)}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (h) => (
        <PillTag variant='blue' size='sm'>
          {h.type}
        </PillTag>
      ),
    },
    {
      key: 'assay',
      header: 'Assay',
      sortable: true,
      render: (h) => <span className='text-sm text-neutral-900 dark:text-white'>{h.assay}</span>,
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{h.coverage}x</span>
      ),
    },
    {
      key: 'overrideCycles',
      header: 'OverrideCycles',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-xs text-neutral-900 dark:text-white'>
          {h.overrideCycles}
        </span>
      ),
    },
    {
      key: 'historyUserId',
      header: 'HistoryUserId',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{h.historyUserId}</span>
      ),
    },
    {
      key: 'historyDate',
      header: 'HistoryDate',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>
          {new Date(h.historyDate).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'historyChangeReason',
      header: 'HistoryChangeReason',
      sortable: true,
      render: (h) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{h.historyChangeReason}</span>
      ),
    },
    {
      key: 'historyType',
      header: 'HistoryType',
      sortable: true,
      render: (h) => (
        <PillTag
          variant={
            h.historyType === 'INSERT' ? 'green' : h.historyType === 'UPDATE' ? 'blue' : 'red'
          }
          size='sm'
        >
          {h.historyType}
        </PillTag>
      ),
    },
    {
      key: 'sample',
      header: 'Sample',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{h.sample}</span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (h) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{h.subject}</span>
      ),
    },
  ];

  return <DataTable data={history} columns={historyColumns} paginationProps={pagination} />;
}
