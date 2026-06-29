import { useNavigate } from 'react-router';
import { DataTable, type Column, type DataTableToolbarAction } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { orderByParam } from '@/utils/queryParams';
import { useQueryMetadataSampleModel, type SampleDetailType } from '../../shared/api/lab.api';
import {
  createCsvDownloadAction,
  createLibraryRows,
  joinTableValues,
  renderLibraryLinks,
  renderStackedQualityPills,
  renderStackedValues,
  renderTextValue,
} from '../../shared/utils';
import { useSampleQueryParams } from '../hooks/useSampleQueryParams';

export function SamplesTable() {
  const navigate = useNavigate();
  const {
    sampleListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    getOrderDirection,
    setOrderBy,
  } = useSampleQueryParams();

  const {
    isRefetching: isRefetchingSamples,
    isLoading: isLoadingSamples,
    isError,
    error,
    data: samples,
    refetch: refetchSamples,
  } = useQueryMetadataSampleModel({
    params: {
      query: sampleListQueryParams,
    },
  });

  const columns: Column<SampleDetailType>[] = [
    {
      key: 'sampleId',
      header: 'Sample ID',
      sortable: true,
      sortDirection: getOrderDirection('sample_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'sample_id')),
      csvValue: (sample) => sample.sampleId ?? '',
      render: (sample) =>
        renderTextValue(
          sample.sampleId,
          'font-mono font-medium text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'externalSampleId',
      header: 'External Sample ID',
      sortable: true,
      sortDirection: getOrderDirection('external_sample_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'external_sample_id')),
      csvValue: (sample) => sample.externalSampleId ?? '',
      render: (sample) => renderTextValue(sample.externalSampleId, 'font-mono'),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      sortDirection: getOrderDirection('source'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'source')),
      csvValue: (sample) => sample.source ?? '',
      render: (sample) => renderTextValue(sample.source),
    },
    {
      key: 'libraryIds',
      header: 'Library ID',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.libraryId)),
      render: (sample) => renderLibraryLinks(createLibraryRows(sample.librarySet), navigate),
    },
    {
      key: 'libraryPhenotypes',
      header: 'Phenotype',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.phenotype)),
      render: (sample) =>
        renderStackedValues(createLibraryRows(sample.librarySet).map((row) => row.phenotype)),
    },
    {
      key: 'libraryWorkflows',
      header: 'Workflow',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.workflow)),
      render: (sample) =>
        renderStackedValues(createLibraryRows(sample.librarySet).map((row) => row.workflow)),
    },
    {
      key: 'libraryQualities',
      header: 'Quality',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.quality)),
      render: (sample) =>
        renderStackedQualityPills(createLibraryRows(sample.librarySet).map((row) => row.quality)),
    },
    {
      key: 'libraryTypes',
      header: 'Type',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.type)),
      render: (sample) =>
        renderStackedValues(createLibraryRows(sample.librarySet).map((row) => row.type)),
    },
    {
      key: 'libraryAssays',
      header: 'Assay',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.assay)),
      render: (sample) =>
        renderStackedValues(createLibraryRows(sample.librarySet).map((row) => row.assay)),
    },
    {
      key: 'libraryCoverage',
      header: 'Coverage',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.coverage)),
      render: (sample) =>
        renderStackedValues(
          createLibraryRows(sample.librarySet).map((row) => row.coverage),
          'text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'libraryOverrideCycles',
      header: 'Override Cycles',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.overrideCycles)),
      render: (sample) =>
        renderStackedValues(
          createLibraryRows(sample.librarySet).map((row) => row.overrideCycles),
          'font-mono text-xs'
        ),
    },
    {
      key: 'libraryRequestFormIds',
      header: 'Request Form ID',
      csvValue: (sample) =>
        joinTableValues(createLibraryRows(sample.librarySet).map((row) => row.requestFormId)),
      render: (sample) =>
        renderStackedValues(
          createLibraryRows(sample.librarySet).map((row) => row.requestFormId),
          'font-mono text-xs'
        ),
    },
  ];

  const toolbarActions: DataTableToolbarAction<SampleDetailType>[] = [
    createCsvDownloadAction<SampleDetailType>('samples'),
  ];

  if (isError) {
    return (
      <ApiErrorState
        title='Unable to load samples'
        error={error}
        onRetry={() => void refetchSamples()}
      />
    );
  }

  return (
    <DataTable
      data={samples?.results || []}
      columns={columns}
      isLoading={isLoadingSamples || isRefetchingSamples}
      selectable
      onRefresh={() => void refetchSamples()}
      toolbarActions={toolbarActions}
      emptyMessage='No samples found'
      paginationProps={{
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: samples?.pagination.count || 0,
      }}
    />
  );
}
