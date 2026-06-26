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
import {
  useQueryMetadataIndividualModel,
  type IndividualDetailType,
} from '../../shared/api/lab.api';
import { useIndividualQueryParams } from '../hooks/useIndividualQueryParams';
import {
  createIndividualSubjectRows,
  joinIndividualTableValues,
  type IndividualSubjectRow,
} from '../utils/individualTableRows';

const STACKED_VALUE_CLASS =
  'flex min-h-7 items-center text-sm text-neutral-700 dark:text-[#9dabb9]';

function renderTextValue(value: string | null | undefined, className = '') {
  return <span className={className}>{value || '-'}</span>;
}

function renderIndividualId(
  individual: IndividualDetailType,
  navigate: ReturnType<typeof useNavigate>
) {
  const individualId = individual.individualId?.trim();

  if (!individualId) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <button
      type='button'
      onClick={(event) => {
        event.stopPropagation();
        void navigate(`/lab?individualId=${encodeURIComponent(individualId)}`);
      }}
      className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
    >
      {individualId}
    </button>
  );
}

function renderSubjectIds(rows: IndividualSubjectRow[], navigate: ReturnType<typeof useNavigate>) {
  if (rows.length === 0) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <div className='flex flex-col gap-1'>
      {rows.map((row, index) => {
        if (row.subjectId === '-') {
          return (
            <span key={`${row.subjectId}-${index}`} className={STACKED_VALUE_CLASS}>
              {row.subjectId}
            </span>
          );
        }

        return (
          <button
            key={`${row.subjectId}-${index}`}
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              void navigate(`/lab/subject?subjectId=${encodeURIComponent(row.subjectId)}`);
            }}
            className={`flex min-h-7 items-center font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400`}
          >
            {row.subjectId}
          </button>
        );
      })}
    </div>
  );
}

export function IndividualsTable() {
  const navigate = useNavigate();
  const {
    individualListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    getOrderDirection,
    setOrderBy,
  } = useIndividualQueryParams();

  const {
    isRefetching: isRefetchingIndividuals,
    isLoading: isLoadingIndividuals,
    isError,
    error,
    data: individuals,
    refetch: refetchIndividuals,
  } = useQueryMetadataIndividualModel({
    params: {
      query: individualListQueryParams,
    },
  });

  const columns: Column<IndividualDetailType>[] = [
    {
      key: 'individualId',
      header: 'Individual ID',
      sortable: true,
      sortDirection: getOrderDirection('individual_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'individual_id')),
      csvValue: (individual) => individual.individualId ?? '',
      render: (individual) => renderIndividualId(individual, navigate),
    },
    {
      key: 'source',
      header: 'Record Source',
      sortable: true,
      sortDirection: getOrderDirection('source'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'source')),
      csvValue: (individual) => individual.source ?? '',
      render: (individual) =>
        renderTextValue(individual.source, 'text-sm text-neutral-700 dark:text-[#9dabb9]'),
    },
    {
      key: 'subjectIds',
      header: 'Subject ID',
      csvValue: (individual) =>
        joinIndividualTableValues(
          createIndividualSubjectRows(individual).map((row) => row.subjectId)
        ),
      render: (individual) => renderSubjectIds(createIndividualSubjectRows(individual), navigate),
    },
  ];

  const handleDownloadCsv = (ctx: DataTableActionContext<IndividualDetailType>) => {
    const hasPartialSelection =
      ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
    const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

    if (rows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    downloadTableAsCsv(rows, ctx.visibleColumns, 'individuals');
    toast.success(
      hasPartialSelection
        ? `Exported ${rows.length} selected row(s) to CSV`
        : `Exported all ${rows.length} row(s) to CSV`
    );
  };

  const toolbarActions: DataTableToolbarAction<IndividualDetailType>[] = [
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
        title='Unable to load individuals'
        error={error}
        onRetry={() => void refetchIndividuals()}
      />
    );
  }

  return (
    <DataTable
      data={individuals?.results || []}
      columns={columns}
      isLoading={isLoadingIndividuals || isRefetchingIndividuals}
      selectable
      onRefresh={() => void refetchIndividuals()}
      toolbarActions={toolbarActions}
      emptyMessage='No individuals found'
      paginationProps={{
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: individuals?.pagination.count || 0,
      }}
    />
  );
}
