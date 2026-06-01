import { useMemo } from 'react';
import { Column, DataTable } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useAnalysisContextListModel, type AnalysisContextModel } from '../../api/workflows.api';
import { useAnalysisContextsListQueryParams } from '../hooks/useAnalysisContextsListQueryParams';

function getUsecasePillVariant(usecase: AnalysisContextModel['usecase']): PillTagVariant {
  return usecase === 'STORAGE' ? 'purple' : 'blue';
}

const AnalysisContextsTable = () => {
  const { analysisContextsQueryParams, setPage, setRowsPerPage } =
    useAnalysisContextsListQueryParams();

  const {
    data: analysisContextsData,
    isRefetching: isRefetchingAnalysisContexts,
    isLoading: isLoadingAnalysisContexts,
    isError,
    error,
    refetch: refetchAnalysisContexts,
  } = useAnalysisContextListModel({
    params: {
      query: {
        ...analysisContextsQueryParams,
      },
    },
  });

  const columns: Column<AnalysisContextModel>[] = useMemo(
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
    return <ApiErrorState error={error} onRetry={() => void refetchAnalysisContexts()} />;
  }

  return (
    <DataTable
      data={analysisContextsData?.results || []}
      columns={columns}
      isLoading={isLoadingAnalysisContexts || isRefetchingAnalysisContexts}
      onRefresh={() => void refetchAnalysisContexts()}
      emptyMessage='No analysis contexts found'
      paginationProps={{
        page: analysisContextsData?.pagination.page || 1,
        pageSize: analysisContextsData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
        onPageChange: (page) => setPage(page ?? 1),
        onPageSizeChange: (size) => setRowsPerPage(size),
        totalItems: analysisContextsData?.pagination.count || 0,
      }}
    />
  );
};

export default AnalysisContextsTable;
