import { useMemo } from 'react';
import { Column, DataTable } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useRunContextListModel, type RunContext } from '../../api/workflows.api';
import { useRunContextsListQueryParams } from '../hooks/useRunContextsListQueryParams';

function getUsecasePillVariant(usecase: RunContext['usecase']): PillTagVariant {
  return usecase === 'STORAGE' ? 'purple' : 'blue';
}

const RunContextsTable = () => {
  const { runContextsQueryParams, setPage, setRowsPerPage } = useRunContextsListQueryParams();

  const {
    data: runContextsData,
    isRefetching: isRefetchingRunContexts,
    isLoading: isLoadingRunContexts,
    isError,
    error,
    refetch: refetchRunContexts,
  } = useRunContextListModel({
    params: {
      query: {
        ...runContextsQueryParams,
      },
    },
  });

  const columns: Column<RunContext>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (context) => (
          <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {context.name}
          </div>
        ),
      },
      {
        key: 'usecase',
        header: 'Use Case',
        sortable: true,
        render: (context) => (
          <PillTag variant={getUsecasePillVariant(context.usecase)}>{context.usecase}</PillTag>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (context) => <StatusBadge status={context.status} />,
      },
      {
        key: 'description',
        header: 'Description',
        sortable: false,
        render: (context) => (
          <div
            className='max-w-md truncate text-sm text-neutral-700 dark:text-neutral-300'
            title={context.description ?? ''}
          >
            {context.description ?? '-'}
          </div>
        ),
      },
      {
        key: 'orcabusId',
        header: 'Orcabus ID',
        sortable: false,
        copyable: true,
        render: (context) => (
          <div
            className='max-w-xs truncate font-mono text-sm text-neutral-500 dark:text-neutral-400'
            title={context.orcabusId}
          >
            {context.orcabusId}
          </div>
        ),
      },
    ],
    []
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetchRunContexts()} />;
  }

  return (
    <DataTable
      data={runContextsData?.results || []}
      columns={columns}
      isLoading={isLoadingRunContexts || isRefetchingRunContexts}
      onRefresh={() => void refetchRunContexts()}
      emptyMessage='No run contexts found'
      paginationProps={{
        page: runContextsData?.pagination.page || 1,
        pageSize: runContextsData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
        onPageChange: (page) => setPage(page ?? 1),
        onPageSizeChange: (size) => setRowsPerPage(size),
        totalItems: runContextsData?.pagination.count || 0,
      }}
    />
  );
};

export default RunContextsTable;
