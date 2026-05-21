import { PillTag } from '@/components/ui/PillTag';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import { useQueryMetadataDetailLibraryHistoryModel, type LibraryHistoryType } from '../api/lab.api';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useLibraryDetailsHistoryQueryParams } from '../hooks/useLibraryDetailsHistoryQueryParams';

export function LibraryDetailsHistoryTable() {
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();

  const { pagination, setPage, setRowsPerPage } = useLibraryDetailsHistoryQueryParams();

  const {
    data: libraryHistory,
    isLoading: isLibraryHistoryLoading,
    isError: isLibraryHistoryError,
    error: libraryHistoryError,
    refetch: refetchLibraryHistory,
  } = useQueryMetadataDetailLibraryHistoryModel({
    params: {
      path: {
        orcabusId: libraryDetail?.orcabusId,
      },
      query: {
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
      },
    },
    reactQuery: {
      enabled: !!libraryDetail && !isLoadingLibraryDetail,
    },
  });

  const historyColumns: Column<LibraryHistoryType>[] = [
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
        <span className='text-sm text-neutral-900 dark:text-white'>{h.quality ?? '-'}</span>
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
          variant={h.historyType === '+' ? 'green' : h.historyType === '~' ? 'blue' : 'red'}
          size='sm'
        >
          {h.historyType === '+' ? 'INSERT' : h.historyType === '~' ? 'UPDATE' : 'DELETE'}
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

  if (isLibraryHistoryError) {
    return (
      <ApiErrorState
        error={libraryHistoryError}
        onRetry={() => {
          void refetchLibraryHistory();
        }}
      />
    );
  }

  return (
    <DataTable
      data={libraryHistory?.results ?? []}
      columns={historyColumns}
      isLoading={isLibraryHistoryLoading}
      onRefresh={() => void refetchLibraryHistory()}
      paginationProps={{
        page: libraryHistory?.pagination.page ?? pagination.page,
        pageSize: libraryHistory?.pagination.rowsPerPage ?? pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: libraryHistory?.pagination.count ?? 0,
      }}
    />
  );
}
