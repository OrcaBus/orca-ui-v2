import { useNavigate } from 'react-router';
import {
  DataTable,
  type Column,
  type DataTableActionContext,
  type DataTableToolbarAction,
} from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { downloadTableAsCsv } from '@/utils/csv';
import { orderByParam } from '@/utils/queryParams';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryMetadataSampleModel, type SampleDetailType } from '../../shared/api/lab.api';
import { useSampleQueryParams } from '../hooks/useSampleQueryParams';
import {
  createSampleLibraryRows,
  joinSampleTableValues,
  type SampleLibraryRow,
} from '../utils/sampleTableRows';

const STACKED_VALUE_CLASS =
  'flex min-h-7 items-center text-sm text-neutral-700 dark:text-[#9dabb9]';

function renderTextValue(value: string | null | undefined, className = '') {
  return <span className={className}>{value || '-'}</span>;
}

function renderStackedValues(values: string[], className = '') {
  if (values.length === 0) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <div className='flex flex-col gap-1'>
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className={`${STACKED_VALUE_CLASS} ${className}`}>
          {value}
        </span>
      ))}
    </div>
  );
}

function renderLibraryIds(rows: SampleLibraryRow[], navigate: ReturnType<typeof useNavigate>) {
  if (rows.length === 0) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <div className='flex flex-col gap-1'>
      {rows.map((row, index) => {
        if (!row.orcabusId || row.libraryId === '-') {
          return (
            <span key={`${row.libraryId}-${index}`} className={STACKED_VALUE_CLASS}>
              {row.libraryId}
            </span>
          );
        }

        return (
          <button
            key={`${row.orcabusId}-${index}`}
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              void navigate(`/lab/libraries/${row.orcabusId}`);
            }}
            className={`flex min-h-7 items-center font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400`}
          >
            {row.libraryId}
          </button>
        );
      })}
    </div>
  );
}

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
          'font-mono text-sm font-medium text-neutral-900 dark:text-slate-100'
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
      render: (sample) =>
        renderTextValue(
          sample.externalSampleId,
          'font-mono text-sm text-neutral-700 dark:text-[#9dabb9]'
        ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      sortDirection: getOrderDirection('source'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'source')),
      csvValue: (sample) => sample.source ?? '',
      render: (sample) =>
        renderTextValue(sample.source, 'text-sm text-neutral-700 dark:text-[#9dabb9]'),
    },
    {
      key: 'libraryIds',
      header: 'Library ID',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.libraryId)),
      render: (sample) => renderLibraryIds(createSampleLibraryRows(sample), navigate),
    },
    {
      key: 'libraryPhenotypes',
      header: 'Phenotype',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.phenotype)),
      render: (sample) =>
        renderStackedValues(createSampleLibraryRows(sample).map((row) => row.phenotype)),
    },
    {
      key: 'libraryWorkflows',
      header: 'Workflow',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.workflow)),
      render: (sample) =>
        renderStackedValues(createSampleLibraryRows(sample).map((row) => row.workflow)),
    },
    {
      key: 'libraryQualities',
      header: 'Quality',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.quality)),
      render: (sample) =>
        renderStackedValues(createSampleLibraryRows(sample).map((row) => row.quality)),
    },
    {
      key: 'libraryTypes',
      header: 'Type',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.type)),
      render: (sample) =>
        renderStackedValues(createSampleLibraryRows(sample).map((row) => row.type)),
    },
    {
      key: 'libraryAssays',
      header: 'Assay',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.assay)),
      render: (sample) =>
        renderStackedValues(createSampleLibraryRows(sample).map((row) => row.assay)),
    },
    {
      key: 'libraryCoverage',
      header: 'Coverage',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.coverage)),
      render: (sample) =>
        renderStackedValues(
          createSampleLibraryRows(sample).map((row) => row.coverage),
          'text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'libraryOverrideCycles',
      header: 'Override Cycles',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.overrideCycles)),
      render: (sample) =>
        renderStackedValues(
          createSampleLibraryRows(sample).map((row) => row.overrideCycles),
          'font-mono text-xs'
        ),
    },
    {
      key: 'libraryRequestFormIds',
      header: 'Request Form ID',
      csvValue: (sample) =>
        joinSampleTableValues(createSampleLibraryRows(sample).map((row) => row.requestFormId)),
      render: (sample) =>
        renderStackedValues(
          createSampleLibraryRows(sample).map((row) => row.requestFormId),
          'font-mono text-xs'
        ),
    },
  ];

  const handleDownloadCsv = (ctx: DataTableActionContext<SampleDetailType>) => {
    const hasPartialSelection =
      ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
    const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

    if (rows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    downloadTableAsCsv(rows, ctx.visibleColumns, 'samples');
    toast.success(
      hasPartialSelection
        ? `Exported ${rows.length} selected row(s) to CSV`
        : `Exported all ${rows.length} row(s) to CSV`
    );
  };

  const toolbarActions: DataTableToolbarAction<SampleDetailType>[] = [
    {
      id: 'download-csv',
      label: 'Download to CSV',
      icon: <Download className='h-4 w-4' />,
      onClick: handleDownloadCsv,
    },
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
