import { PillTag } from '@/components/ui/PillTag';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import {
  useQueryMetadataDetailLibraryHistoryModel,
  type LibraryHistoryType,
} from '../../shared/api/lab.api';
import { renderQualityPill, renderTextValue } from '../../shared/utils';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useLibraryDetailsHistoryQueryParams } from '../hooks/useLibraryDetailsHistoryQueryParams';

/** History rows use a higher-contrast text colour than the muted lab list tables. */
const HISTORY_TEXT_CLASS = 'text-neutral-900 dark:text-white';

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
      render: (h) => renderTextValue(h.historyId, `font-mono ${HISTORY_TEXT_CLASS}`),
    },
    {
      key: 'projectSet',
      header: 'Project Set',
      sortable: true,
      render: (h) => renderTextValue(h.projectSet.join(', '), HISTORY_TEXT_CLASS),
    },
    {
      key: 'orcabusId',
      header: 'Orcabus ID',
      sortable: true,
      render: (h) => renderTextValue(h.orcabusId, 'font-mono text-xs'),
    },
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      render: (h) => renderTextValue(h.libraryId, `font-mono ${HISTORY_TEXT_CLASS}`),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      render: (h) => renderTextValue(h.phenotype, `capitalize ${HISTORY_TEXT_CLASS}`),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      render: (h) => renderTextValue(h.workflow, HISTORY_TEXT_CLASS),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      render: (h) => renderQualityPill(h.quality),
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
      render: (h) => renderTextValue(h.assay, HISTORY_TEXT_CLASS),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      render: (h) =>
        renderTextValue(
          typeof h.coverage === 'number' ? `${h.coverage}x` : null,
          HISTORY_TEXT_CLASS
        ),
    },
    {
      key: 'overrideCycles',
      header: 'OverrideCycles',
      sortable: true,
      render: (h) => renderTextValue(h.overrideCycles, `font-mono text-xs ${HISTORY_TEXT_CLASS}`),
    },
    {
      key: 'historyUserId',
      header: 'HistoryUserId',
      sortable: true,
      render: (h) => renderTextValue(h.historyUserId, HISTORY_TEXT_CLASS),
    },
    {
      key: 'historyDate',
      header: 'HistoryDate',
      sortable: true,
      render: (h) => renderTextValue(new Date(h.historyDate).toLocaleString(), HISTORY_TEXT_CLASS),
    },
    {
      key: 'historyChangeReason',
      header: 'HistoryChangeReason',
      sortable: true,
      render: (h) => renderTextValue(h.historyChangeReason, HISTORY_TEXT_CLASS),
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
      render: (h) => renderTextValue(h.sample, `font-mono ${HISTORY_TEXT_CLASS}`),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (h) => renderTextValue(h.subject, `font-mono ${HISTORY_TEXT_CLASS}`),
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
