import { Column, DataTable } from '@/components/tables/DataTable';
import {
  useAnalysisRunsQueryParams,
  type AnalysisRunStatus,
} from '../hooks/useAnalysisRunsQueryParams';
import { useAnalysisRunListModel, type AnalysisRunListModel } from '../../api/workflows.api';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

const AnalysisRunsTable = () => {
  const navigate = useNavigate();
  const { analysisRunListQueryParams, setPage, setRowsPerPage } = useAnalysisRunsQueryParams();

  const {
    data: analysisRunsData,
    isFetching: isFetchingAnalysisRuns,
    isLoading: isLoadingAnalysisRuns,
    isError,
    error,
    refetch: refetchAnalysisRuns,
  } = useAnalysisRunListModel({
    params: {
      query: {
        ...analysisRunListQueryParams,
        page: analysisRunListQueryParams.page || 1,
        rowsPerPage: analysisRunListQueryParams.rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const columns: Column<AnalysisRunListModel>[] = useMemo(
    () => [
      {
        key: 'analysisRunName',
        header: 'Analysis Run Name',
        sortable: true,
        render: (ar) => (
          <button
            onClick={() => {
              void navigate(`/workflows/analysisrun/${ar.orcabusId}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {ar.analysisRunName}
          </button>
        ),
      },
      //   {
      //     key: 'analysisType',
      //     header: 'Analysis Type',
      //     sortable: true,
      //     render: (ar) => (
      //       <div>
      //         <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
      //           {ar.analysis.analysisName}
      //         </div>
      //       </div>
      //     ),
      //   },
      {
        key: 'status',
        header: 'State',
        sortable: true,
        render: (ar) => (
          <StatusBadge status={ar.currentState?.status?.toLowerCase() as AnalysisRunStatus} />
        ),
      },
      {
        key: 'comment',
        header: 'Comment',
        sortable: false,
        render: (ar) => (
          <div
            className='max-w-md truncate text-sm text-neutral-700 dark:text-neutral-300'
            title={ar.comment ?? ''}
          >
            {ar.comment}
          </div>
        ),
      },
      {
        key: 'currentState',
        header: 'Timestamp',
        sortable: true,
        render: (ar) => (
          <div className='text-sm'>{formatTableDate(ar.currentState?.timestamp ?? '')}</div>
        ),
      },
      {
        key: 'library',
        header: 'Linkages',
        sortable: true,
        render: (ar) => (
          <div className='flex flex-wrap gap-2'>
            <PillTag variant='blue'>{ar.libraries.length} libraries</PillTag>
            <PillTag variant='purple'>{ar.contexts.length} contexts</PillTag>
            <PillTag variant='green'>{ar.readsets.length} readsets</PillTag>
          </div>
        ),
      },
    ],
    [navigate]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetchAnalysisRuns()} />;
  }

  return (
    <DataTable
      data={analysisRunsData?.results || []}
      columns={columns}
      isLoading={isLoadingAnalysisRuns || isFetchingAnalysisRuns}
      selectable
      onRefresh={() => void refetchAnalysisRuns()}
      emptyMessage='No analysis runs found'
      paginationProps={{
        page: analysisRunsData?.pagination.page || 1,
        pageSize: analysisRunsData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
        onPageChange: (p) => setPage(p ?? 1),
        onPageSizeChange: (size) => setRowsPerPage(size),
        totalItems: analysisRunsData?.pagination.count || 0,
      }}
    />
  );
};

export default AnalysisRunsTable;
