import { useNavigate } from 'react-router';
import { DataTable, Column, DataTableToolbarAction } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useQueryMetadataLibraryModel, type LibraryDetailType } from '../../shared/api/lab.api';
import {
  createCsvDownloadAction,
  renderClickableId,
  renderQualityPill,
  renderTextValue,
} from '../../shared/utils';
import { useLibraryQueryParams } from '../hooks/useLibraryQueryParams';
import { orderByParam } from '@/utils/queryParams';

export function LibrariesTable() {
  const navigate = useNavigate();
  const {
    libraryListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    getOrderDirection,
    setOrderBy,
  } = useLibraryQueryParams();
  const {
    isRefetching: isRefetchingLibraries,
    isLoading: isLoadingLibraries,
    isError,
    error,
    data: libraries,
    refetch: refetchLibraries,
  } = useQueryMetadataLibraryModel({
    params: {
      query: libraryListQueryParams,
    },
  });

  const columns: Column<LibraryDetailType>[] = [
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      sortDirection: getOrderDirection('library_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'library_id')),
      render: (lib) =>
        renderClickableId(lib.libraryId, navigate, () => `/lab/libraries/${lib.orcabusId}`),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      sortDirection: getOrderDirection('phenotype'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'phenotype')),
      render: (lib) => renderTextValue(lib.phenotype),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      sortDirection: getOrderDirection('workflow'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'workflow')),
      render: (lib) => renderTextValue(lib.workflow, 'text-neutral-600'),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      sortDirection: getOrderDirection('quality'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'quality')),
      render: (lib) => renderQualityPill(lib.quality),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortDirection: getOrderDirection('type'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'type')),
      render: (lib) => renderTextValue(lib.type, 'truncate'),
    },
    {
      key: 'assay',
      header: 'Assay',
      sortable: true,
      sortDirection: getOrderDirection('assay'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'assay')),
      render: (lib) => renderTextValue(lib.assay, 'truncate'),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      sortDirection: getOrderDirection('coverage'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'coverage')),
      render: (lib) => renderTextValue(lib.coverage, 'text-neutral-900 dark:text-slate-100'),
    },
    {
      key: 'overrideCycles',
      header: 'Override Cycles',
      sortable: true,
      sortDirection: getOrderDirection('override_cycles'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'override_cycles')),
      render: (lib) => renderTextValue(lib.overrideCycles, 'font-mono text-xs text-neutral-600'),
    },
    {
      key: 'subject',
      header: 'Subject ID',
      csvValue: (lib) => lib.subject?.subjectId ?? '',
      render: (lib) => renderTextValue(lib.subject?.subjectId),
    },
    {
      key: 'sample',
      header: 'Sample ID',
      csvValue: (lib) => lib.sample.sampleId ?? '',
      render: (lib) => renderTextValue(lib.sample.sampleId),
    },
    {
      key: 'externalSampleId',
      header: 'External Sample ID',
      csvValue: (lib) => lib.sample.externalSampleId ?? '',
      render: (lib) => renderTextValue(lib.sample.externalSampleId),
    },
    {
      key: 'projectSet',
      header: 'Project ID',
      csvValue: (lib) => lib.projectSet.map((p) => p.projectId).join(', '),
      render: (lib) =>
        renderTextValue(lib.projectSet.map((project) => project.projectId).join(', ')),
    },
    {
      key: 'projectName',
      header: 'Project Name',
      sortable: false,
      csvValue: (lib) => lib.projectSet.map((p) => p.name).join(', '),
      render: (lib) =>
        renderTextValue(
          lib.projectSet.map((project) => project.name).join(', '),
          'block max-w-37.5 truncate text-xs'
        ),
    },
    {
      key: 'requestFormId',
      header: 'Request ID',
      sortable: false,
      csvValue: (lib) => lib.requestFormId ?? '',
      render: (lib) => renderTextValue(lib.requestFormId),
    },
  ];

  const toolbarActions: DataTableToolbarAction<LibraryDetailType>[] = [
    createCsvDownloadAction<LibraryDetailType>('libraries'),
  ];

  if (isError) {
    return (
      <ApiErrorState
        title='Unable to load libraries'
        error={error}
        onRetry={() => void refetchLibraries()}
      />
    );
  }

  return (
    <DataTable
      data={libraries?.results || []}
      columns={columns}
      isLoading={isLoadingLibraries || isRefetchingLibraries}
      selectable
      onRefresh={() => void refetchLibraries()}
      toolbarActions={toolbarActions}
      emptyMessage='No libraries found'
      paginationProps={{
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: libraries?.pagination.count || 0,
      }}
    />
  );
}
