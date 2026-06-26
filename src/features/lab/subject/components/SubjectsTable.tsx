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
import { useQueryMetadataSubjectModel, type SubjectDetailType } from '../../shared/api/lab.api';
import { useSubjectQueryParams } from '../hooks/useSubjectQueryParams';
import {
  createSubjectIndividualRows,
  createSubjectLibraryRows,
  joinSubjectTableValues,
  type SubjectLibraryRow,
} from '../utils/subjectTableRows';

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

function renderLibraryIds(rows: SubjectLibraryRow[], navigate: ReturnType<typeof useNavigate>) {
  if (rows.length === 0) {
    return <span className='text-sm dark:text-[#9dabb9]'>-</span>;
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
            className={`flex min-h-7 items-center font-mono text-sm font-medium text-blue-600! hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400`}
          >
            {row.libraryId}
          </button>
        );
      })}
    </div>
  );
}

export function SubjectsTable() {
  const navigate = useNavigate();
  const {
    subjectListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    getOrderDirection,
    setOrderBy,
  } = useSubjectQueryParams();

  const {
    isRefetching: isRefetchingSubjects,
    isLoading: isLoadingSubjects,
    isError,
    error,
    data: subjects,
    refetch: refetchSubjects,
  } = useQueryMetadataSubjectModel({
    params: {
      query: subjectListQueryParams,
    },
  });

  const columns: Column<SubjectDetailType>[] = [
    {
      key: 'subjectId',
      header: 'Subject ID',
      sortable: true,
      sortDirection: getOrderDirection('subject_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'subject_id')),
      csvValue: (subject) => subject.subjectId ?? '',
      render: (subject) =>
        renderTextValue(
          subject.subjectId,
          'font-mono text-sm font-medium text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'individualIds',
      header: 'Individual ID (SBJ ID)',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectIndividualRows(subject).map((row) => row.individualId)),
      render: (subject) =>
        renderStackedValues(createSubjectIndividualRows(subject).map((row) => row.individualId)),
    },
    {
      key: 'individualSources',
      header: 'Individual Source',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectIndividualRows(subject).map((row) => row.source)),
      render: (subject) =>
        renderStackedValues(createSubjectIndividualRows(subject).map((row) => row.source)),
    },
    {
      key: 'libraryIds',
      header: 'Library ID',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.libraryId)),
      render: (subject) => renderLibraryIds(createSubjectLibraryRows(subject), navigate),
    },
    {
      key: 'libraryPhenotypes',
      header: 'Phenotype',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.phenotype)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.phenotype)),
    },
    {
      key: 'libraryWorkflows',
      header: 'Workflow',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.workflow)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.workflow)),
    },
    {
      key: 'libraryQualities',
      header: 'Quality',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.quality)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.quality)),
    },
    {
      key: 'libraryTypes',
      header: 'Type',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.type)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.type)),
    },
    {
      key: 'libraryAssays',
      header: 'Assay',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.assay)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.assay)),
    },
    {
      key: 'libraryCoverage',
      header: 'Coverage',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.coverage)),
      render: (subject) =>
        renderStackedValues(
          createSubjectLibraryRows(subject).map((row) => row.coverage),
          'text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'libraryOverrideCycles',
      header: 'Override Cycles',
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.overrideCycles)),
      render: (subject) =>
        renderStackedValues(
          createSubjectLibraryRows(subject).map((row) => row.overrideCycles),
          'font-mono text-xs'
        ),
    },
    {
      key: 'libraryRequestFormId',
      header: 'Request ID',
      sortable: false,
      csvValue: (subject) =>
        joinSubjectTableValues(createSubjectLibraryRows(subject).map((row) => row.requestFormId)),
      render: (subject) =>
        renderStackedValues(createSubjectLibraryRows(subject).map((row) => row.requestFormId)),
    },
  ];

  const handleDownloadCsv = (ctx: DataTableActionContext<SubjectDetailType>) => {
    const hasPartialSelection =
      ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
    const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

    if (rows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    downloadTableAsCsv(rows, ctx.visibleColumns, 'subjects');
    toast.success(
      hasPartialSelection
        ? `Exported ${rows.length} selected row(s) to CSV`
        : `Exported all ${rows.length} row(s) to CSV`
    );
  };

  const toolbarActions: DataTableToolbarAction<SubjectDetailType>[] = [
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
        title='Unable to load subjects'
        error={error}
        onRetry={() => void refetchSubjects()}
      />
    );
  }

  return (
    <DataTable
      data={subjects?.results || []}
      columns={columns}
      isLoading={isLoadingSubjects || isRefetchingSubjects}
      selectable
      onRefresh={() => void refetchSubjects()}
      toolbarActions={toolbarActions}
      emptyMessage='No subjects found'
      paginationProps={{
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: subjects?.pagination.count || 0,
      }}
    />
  );
}
