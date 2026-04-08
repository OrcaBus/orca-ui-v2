import { Column, DataTable } from '@/components/tables/DataTable';
import { useAnalysisTypesQueryParams } from '../hooks/useAnalysisTypesQueryParams';
import { useAnalysisListModel, type AnalysisModel } from '../../api/workflows.api';
import { useMemo } from 'react';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { Eye } from 'lucide-react';
import { useAnalysisTypeDetailDrawer } from '../hooks/useAnalysisTypeDetailDrawer';
import { AnalysisTypeDetailsDrawer } from './AnalysisTypeDetailsDrawer';

const AnalysisTypesTable = () => {
  const { analysisTypesQueryParams, setPage, setRowsPerPage } = useAnalysisTypesQueryParams();
  const { selectedAnalysisTypeId, openDetail, closeDetail } = useAnalysisTypeDetailDrawer();
  const {
    data: analysisData,
    isFetching: isFetchingAnalysisData,
    isLoading: isLoadingAnalysisData,
    isError,
    error,
    refetch: refetchAnalysis,
  } = useAnalysisListModel({
    params: {
      query: {
        ...analysisTypesQueryParams,
        page: analysisTypesQueryParams.page || 1,
        rowsPerPage: analysisTypesQueryParams.rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const selectedAnalysisType = useMemo(
    () =>
      selectedAnalysisTypeId
        ? (analysisData?.results.find((at) => at.orcabusId === selectedAnalysisTypeId) ?? null)
        : null,
    [selectedAnalysisTypeId, analysisData]
  );

  const columns: Column<AnalysisModel>[] = useMemo(
    () => [
      {
        key: 'analysisName',
        header: 'Name',
        sortable: true,
        render: (at) => (
          <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {at.analysisName}
          </div>
        ),
      },
      {
        key: 'analysisVersion',
        header: 'Version',
        sortable: true,
        render: (at) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{at.analysisVersion}</div>
        ),
      },

      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (at) => <StatusBadge status={at.status} />,
      },
      {
        key: 'description',
        header: 'Description',
        sortable: false,
        render: (at) => (
          <div
            className='max-w-md truncate text-sm text-neutral-700 dark:text-neutral-300'
            title={at.description ?? ''}
          >
            {at.description ?? '—'}
          </div>
        ),
      },
      {
        key: 'linkage',
        header: 'Linkage',
        sortable: false,
        render: (at) => (
          <div className='flex flex-wrap items-center gap-2'>
            <PillTag variant='blue'>
              {at.workflows.length} {at.workflows.length === 1 ? 'workflow' : 'workflows'}
            </PillTag>
            <PillTag variant='purple'>
              {at.contexts.length} {at.contexts.length === 1 ? 'context' : 'contexts'}
            </PillTag>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (at) => (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => openDetail(at.orcabusId)}
              className='pointer-events-auto cursor-pointer rounded p-1.5 text-neutral-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-neutral-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
              title='View workflow details & history'
            >
              <Eye className='h-4 w-4' />
            </button>
          </div>
        ),
      },
    ],
    [openDetail]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetchAnalysis()} />;
  }

  return (
    <>
      <DataTable
        data={analysisData?.results || []}
        columns={columns}
        isLoading={isLoadingAnalysisData || isFetchingAnalysisData}
        onRefresh={() => void refetchAnalysis()}
        emptyMessage='No analysis types found'
        paginationProps={{
          page: analysisData?.pagination.page || 1,
          pageSize: analysisData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: analysisData?.pagination.count || 0,
        }}
      />
      {selectedAnalysisTypeId && selectedAnalysisType && (
        <AnalysisTypeDetailsDrawer analysisType={selectedAnalysisType} onClose={closeDetail} />
      )}
    </>
  );
};

export default AnalysisTypesTable;
