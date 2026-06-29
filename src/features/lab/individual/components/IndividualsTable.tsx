import { useNavigate } from 'react-router';
import { DataTable, type Column, type DataTableToolbarAction } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { orderByParam } from '@/utils/queryParams';
import {
  useQueryMetadataIndividualModel,
  type IndividualDetailType,
} from '../../shared/api/lab.api';
import {
  createCsvDownloadAction,
  EMPTY_TABLE_VALUE,
  joinTableValues,
  renderClickableId,
  renderStackedLinks,
  renderTextValue,
} from '../../shared/utils';
import { useIndividualQueryParams } from '../hooks/useIndividualQueryParams';
import { createIndividualSubjectRows } from '../utils/individualTableRows';

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
      render: (individual) =>
        renderClickableId(
          individual.individualId,
          navigate,
          (id) => `/lab?individualId=${encodeURIComponent(id)}`
        ),
    },
    {
      key: 'source',
      header: 'Record Source',
      sortable: true,
      sortDirection: getOrderDirection('source'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'source')),
      csvValue: (individual) => individual.source ?? '',
      render: (individual) => renderTextValue(individual.source),
    },
    {
      key: 'subjectIds',
      header: 'Subject ID',
      csvValue: (individual) =>
        joinTableValues(createIndividualSubjectRows(individual).map((row) => row.subjectId)),
      render: (individual) =>
        renderStackedLinks(
          createIndividualSubjectRows(individual).map((row) => ({
            label: row.subjectId,
            href:
              row.subjectId !== EMPTY_TABLE_VALUE
                ? `/lab/subject?subjectId=${encodeURIComponent(row.subjectId)}`
                : null,
          })),
          navigate
        ),
    },
  ];

  const toolbarActions: DataTableToolbarAction<IndividualDetailType>[] = [
    createCsvDownloadAction<IndividualDetailType>('individuals'),
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
