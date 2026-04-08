import { Column, DataTable } from '@/components/tables/DataTable';
import {
  useWorkflowTypesQueryParams,
  type ValidationState,
} from '../hooks/useWorkflowTypesQueryParams';
import { useWorkflowGroupedModel, type WorkflowListModel } from '../../api/workflows.api';
import { useMemo } from 'react';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { Eye } from 'lucide-react';
import { WorkflowTypeDetailsDrawer } from './WorkflowTypeDetailsDrawer';
import { useWorkflowTypeDetailDrawer } from '../hooks/useWorkflowTypeDetailDrawer';
import { getExecutionEnginePillVariant } from '../../shared/utils/executionEnginePill';

const WorkflowTypesTable = () => {
  const { workflowTypesQueryParams, setPage, setRowsPerPage } = useWorkflowTypesQueryParams();
  const { selectedWorkflowTypeId, openDetail, closeDetail } = useWorkflowTypeDetailDrawer();
  const {
    data: workflowData,
    isFetching: isFetchingWorkflowsData,
    isLoading: isLoadingWorkflowsData,
    isError,
    error,
    refetch: refetchWorkflows,
  } = useWorkflowGroupedModel({
    params: {
      query: {
        ...workflowTypesQueryParams,
        page: workflowTypesQueryParams.page || 1,
        rowsPerPage: workflowTypesQueryParams.rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const selectedWorkflowType = useMemo(
    () =>
      selectedWorkflowTypeId
        ? (workflowData?.results.find((wt) => wt.orcabusId === selectedWorkflowTypeId) ?? null)
        : null,
    [selectedWorkflowTypeId, workflowData]
  );

  const columns: Column<WorkflowListModel>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Name',
        sortable: true,
        render: (wt) => (
          <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {wt.name}
          </div>
        ),
      },
      {
        key: 'version',
        header: 'Version',
        sortable: true,
        render: (wt) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{wt.version}</div>
        ),
      },
      {
        key: 'codeVersion',
        header: 'Code Version',
        sortable: true,
        render: (wt) => (
          <div className='font-mono text-sm text-neutral-600 dark:text-neutral-400'>
            {wt.codeVersion}
          </div>
        ),
      },
      {
        key: 'executionEngine',
        header: 'Execution Engine',
        sortable: true,
        render: (wt) => (
          <PillTag variant={getExecutionEnginePillVariant(wt.executionEngine)}>
            {wt.executionEngine}
          </PillTag>
        ),
      },
      {
        key: 'executionEnginePipelineId',
        header: 'Execution Engine Pipeline ID',
        sortable: true,
        render: (wt) => (
          <div className='max-w-xs truncate font-mono text-sm text-neutral-500'>
            {wt.executionEnginePipelineId}
          </div>
        ),
      },
      {
        key: 'validationState',
        header: 'Validation State',
        sortable: true,
        render: (_wt) => (
          <StatusBadge status={_wt?.validationState?.toLowerCase() as ValidationState} />
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (wt) => (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => openDetail(wt.orcabusId)}
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
    return <ApiErrorState error={error} onRetry={() => void refetchWorkflows()} />;
  }

  return (
    <>
      <DataTable
        data={workflowData?.results || []}
        columns={columns}
        isLoading={isLoadingWorkflowsData || isFetchingWorkflowsData}
        onRefresh={() => void refetchWorkflows()}
        emptyMessage='No workflow types found'
        paginationProps={{
          page: workflowData?.pagination.page || 1,
          pageSize: workflowData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: workflowData?.pagination.count || 0,
        }}
      />
      {selectedWorkflowTypeId && selectedWorkflowType && (
        <WorkflowTypeDetailsDrawer workflowType={selectedWorkflowType} onClose={closeDetail} />
      )}
    </>
  );
};

export default WorkflowTypesTable;
