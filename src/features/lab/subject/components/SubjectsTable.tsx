import { useNavigate } from 'react-router';
import { DataTable, type Column, type DataTableToolbarAction } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { orderByParam } from '@/utils/queryParams';
import { useQueryMetadataSubjectModel, type SubjectDetailType } from '../../shared/api/lab.api';
import {
  createCsvDownloadAction,
  createLibraryRows,
  joinTableValues,
  renderLibraryLinks,
  renderStackedQualityPills,
  renderStackedValues,
  renderTextValue,
} from '../../shared/utils';
import { useSubjectQueryParams } from '../hooks/useSubjectQueryParams';
import { createSubjectIndividualRows } from '../utils/subjectTableRows';

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
          'font-mono font-medium text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'individualIds',
      header: 'Individual ID (SBJ ID)',
      csvValue: (subject) =>
        joinTableValues(createSubjectIndividualRows(subject).map((row) => row.individualId)),
      render: (subject) =>
        renderStackedValues(createSubjectIndividualRows(subject).map((row) => row.individualId)),
    },
    {
      key: 'individualSources',
      header: 'Individual Source',
      csvValue: (subject) =>
        joinTableValues(createSubjectIndividualRows(subject).map((row) => row.source)),
      render: (subject) =>
        renderStackedValues(createSubjectIndividualRows(subject).map((row) => row.source)),
    },
    {
      key: 'libraryIds',
      header: 'Library ID',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.libraryId)),
      render: (subject) => renderLibraryLinks(createLibraryRows(subject.librarySet), navigate),
    },
    {
      key: 'libraryPhenotypes',
      header: 'Phenotype',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.phenotype)),
      render: (subject) =>
        renderStackedValues(createLibraryRows(subject.librarySet).map((row) => row.phenotype)),
    },
    {
      key: 'libraryWorkflows',
      header: 'Workflow',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.workflow)),
      render: (subject) =>
        renderStackedValues(createLibraryRows(subject.librarySet).map((row) => row.workflow)),
    },
    {
      key: 'libraryQualities',
      header: 'Quality',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.quality)),
      render: (subject) =>
        renderStackedQualityPills(createLibraryRows(subject.librarySet).map((row) => row.quality)),
    },
    {
      key: 'libraryTypes',
      header: 'Type',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.type)),
      render: (subject) =>
        renderStackedValues(createLibraryRows(subject.librarySet).map((row) => row.type)),
    },
    {
      key: 'libraryAssays',
      header: 'Assay',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.assay)),
      render: (subject) =>
        renderStackedValues(createLibraryRows(subject.librarySet).map((row) => row.assay)),
    },
    {
      key: 'libraryCoverage',
      header: 'Coverage',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.coverage)),
      render: (subject) =>
        renderStackedValues(
          createLibraryRows(subject.librarySet).map((row) => row.coverage),
          'text-neutral-900 dark:text-slate-100'
        ),
    },
    {
      key: 'libraryOverrideCycles',
      header: 'Override Cycles',
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.overrideCycles)),
      render: (subject) =>
        renderStackedValues(
          createLibraryRows(subject.librarySet).map((row) => row.overrideCycles),
          'font-mono text-xs'
        ),
    },
    {
      key: 'libraryRequestFormId',
      header: 'Request ID',
      sortable: false,
      csvValue: (subject) =>
        joinTableValues(createLibraryRows(subject.librarySet).map((row) => row.requestFormId)),
      render: (subject) =>
        renderStackedValues(createLibraryRows(subject.librarySet).map((row) => row.requestFormId)),
    },
  ];

  const toolbarActions: DataTableToolbarAction<SubjectDetailType>[] = [
    createCsvDownloadAction<SubjectDetailType>('subjects'),
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
