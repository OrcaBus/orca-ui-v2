import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { ApiErrorState } from '../../../components/ui/ApiErrorState';
import { PillTag } from '../../../components/ui/PillTag';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useCasesListQueryParams } from '../hooks/useCasesListQueryParams';
import { useCaseListModel, type CaseDetailModel } from '../api/cases.api';
import { getCaseStatusVisual } from '../utils/caseStatus.visuals';
import { formatCaseText } from '../utils/caseDisplay';
import { formatCalendarDate } from '@/utils/timeFormat';
import { orderByParam } from '@/utils/queryParams';

export function CasesListTable() {
  const navigate = useNavigate();
  const { caseListQueryParams, setPage, setRowsPerPage, setOrderBy, getOrderDirection } =
    useCasesListQueryParams();

  const {
    data: caseList,
    isLoading,
    isError,
    error,
    refetch,
  } = useCaseListModel({
    params: {
      query: {
        ...caseListQueryParams,
      },
    },
  });

  const columns: Column<CaseDetailModel>[] = useMemo(
    () => [
      {
        key: 'requestFormId',
        header: 'Request Form ID',
        sortable: true,
        sortDirection: getOrderDirection('request_form_id'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'request_form_id')),
        render: (case_) => (
          <button
            onClick={() => void navigate(`/cases/${case_.orcabusId}`)}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {case_.requestFormId}
          </button>
        ),
      },
      {
        key: 'alias',
        header: 'Alias',
        sortable: false,
        render: (case_) => (
          <div className='font-mono text-sm text-neutral-700 dark:text-neutral-300'>
            {case_.alias?.length ? case_.alias.join(', ') : '-'}
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        sortable: false,
        render: (case_) => (
          <div
            className='max-w-md truncate text-sm text-neutral-600 dark:text-neutral-400'
            title={case_.description ?? undefined}
          >
            {case_.description ?? '-'}
          </div>
        ),
      },
      {
        key: 'studyName',
        header: 'Study',
        sortable: true,
        sortDirection: getOrderDirection('study_name'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'study_name')),
        render: (case_) => (
          <div className='min-w-36'>
            <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
              {formatCaseText(case_.studyName)}
            </div>
            <div className='font-mono text-xs text-neutral-500 dark:text-neutral-400'>
              {formatCaseText(case_.studyId)}
            </div>
          </div>
        ),
      },
      {
        key: 'urNumber',
        header: 'UR Number',
        sortable: true,
        sortDirection: getOrderDirection('ur_number'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'ur_number')),
        render: (case_) => (
          <span className='font-mono text-sm text-neutral-700 dark:text-neutral-300'>
            {formatCaseText(case_.urNumber)}
          </span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        sortDirection: getOrderDirection('type'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'type')),
        render: (case_) => (
          <PillTag variant='blue' size='sm'>
            {case_.type}
          </PillTag>
        ),
      },
      {
        key: 'studyType',
        header: 'Study Type',
        sortable: true,
        sortDirection: getOrderDirection('study_type'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'study_type')),
        render: (case_) => (
          <PillTag variant='neutral' size='sm'>
            {case_.studyType}
          </PillTag>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: false,
        render: (case_) => {
          if (!case_.latestState?.status) {
            return <span className='text-sm text-neutral-400 dark:text-neutral-600'>—</span>;
          }
          const { variant, label } = getCaseStatusVisual(case_.latestState.status);
          return (
            <PillTag variant={variant} size='sm'>
              {label}
            </PillTag>
          );
        },
      },
      {
        key: 'dueDate',
        header: 'Due Date',
        sortable: true,
        sortDirection: getOrderDirection('due_date'),
        defaultSortDirection: 'desc',
        onSort: (direction) => setOrderBy(orderByParam(direction, 'due_date')),
        render: (case_) => (
          <span className='text-sm font-medium whitespace-nowrap text-neutral-700 dark:text-neutral-300'>
            {case_.dueDate ? formatCalendarDate(case_.dueDate) : '—'}
          </span>
        ),
      },
      {
        key: 'isNataAccredited',
        header: 'NATA Accredited',
        render: (case_) =>
          case_.isNataAccredited ? (
            <PillTag variant='green' size='sm'>
              Yes
            </PillTag>
          ) : (
            <PillTag variant='neutral' size='sm'>
              No
            </PillTag>
          ),
      },
      {
        header: 'Report Required',
        key: 'isReportRequired',
        render: (case_) =>
          case_.isReportRequired ? (
            <PillTag variant='green' size='sm'>
              Yes
            </PillTag>
          ) : (
            <PillTag variant='neutral' size='sm'>
              No
            </PillTag>
          ),
      },
    ],
    [getOrderDirection, navigate, setOrderBy]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <DataTable<CaseDetailModel>
      data={caseList?.results ?? []}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => void refetch()}
      emptyMessage='No cases found.'
      paginationProps={{
        page: caseList?.pagination.page ?? 1,
        pageSize: caseList?.pagination.rowsPerPage ?? DEFAULT_PAGE_SIZE,
        onPageChange: (p) => setPage(p ?? 1),
        onPageSizeChange: (size) => setRowsPerPage(size),
        totalItems: caseList?.pagination.count ?? 0,
      }}
    />
  );
}
