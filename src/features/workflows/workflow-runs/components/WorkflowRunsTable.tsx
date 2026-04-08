import { Column, DataTable } from '@/components/tables/DataTable';
import { useWorkflowRunsQueryParams, WorkflowRunStatus } from '../hooks/useWorkflowRunsQueryParams';
import { useWorkflowRunListModel, type WorkflowRunListModel } from '../../api/workflows.api';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

const WorkflowRunsTable = () => {
  const navigate = useNavigate();
  const { workflowRunListQueryParams, setPage, setRowsPerPage } = useWorkflowRunsQueryParams();

  const {
    data: workflowRuns,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchWorkflowRuns,
  } = useWorkflowRunListModel({
    params: {
      query: {
        ...workflowRunListQueryParams,
        page: workflowRunListQueryParams.page || 1,
        rowsPerPage: workflowRunListQueryParams.rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const columns: Column<WorkflowRunListModel>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Run Name',
        sortable: true,
        render: (wf) => (
          <button
            onClick={() => {
              void navigate(`/workflows/workflowrun/${wf.orcabusId}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {wf.workflowRunName}
          </button>
        ),
      },
      {
        key: 'portalRunId',
        header: 'Portal Run ID',
        sortable: true,
        render: (wf) => (
          <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {wf.portalRunId}
          </div>
        ),
      },

      {
        key: 'workflowType',
        header: 'Workflow Type',
        sortable: true,
        render: (wf) => <PillTag variant='blue'>{wf.workflow.name}</PillTag>,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (wf) => {
          const status = (wf.currentState?.status as string)?.toLowerCase() as WorkflowRunStatus;
          return <StatusBadge status={status} />;
        },
      },
      {
        key: 'lastModified',
        header: 'Last Modified',
        sortable: true,
        render: (wf) => (
          <div className='text-sm'>{formatTableDate(wf.currentState.timestamp as string)}</div>
        ),
      },
    ],
    [navigate]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetchWorkflowRuns()} />;
  }

  return (
    <DataTable
      data={workflowRuns?.results || []}
      columns={columns}
      isLoading={isLoading || isFetching}
      selectable
      onRefresh={() => void refetchWorkflowRuns()}
      emptyMessage='No workflow runs found'
      paginationProps={{
        page: workflowRuns?.pagination.page || 1,
        pageSize: workflowRuns?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
        onPageChange: (p) => setPage(p ?? 1),
        onPageSizeChange: (size) => setRowsPerPage(size),
        totalItems: workflowRuns?.pagination.count || 0,
      }}
    />
  );
};

export default WorkflowRunsTable;
