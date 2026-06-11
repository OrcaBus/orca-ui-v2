import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { FileSearch } from 'lucide-react';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatTableDate } from '@/utils/timeFormat';
import {
  useWorkflowRunListModel,
  type WorkflowRunListModel,
} from '@/features/runs/shared/api/workflows.api';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import { useLibraryDetailsWorkflowRuns } from '../context/LibraryDetailsWorkflowRunsContext';
import { useLibraryDetailsWorkflowRunsQueryParams } from '../hooks/useLibraryDetailsWorkflowRunsQueryParams';

export function LibraryDetailsWorkflowRunsTable() {
  const navigate = useNavigate();
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();
  const {
    selectedWorkflowOrcabusIds,
    selectedWorkflowTypeGroup,
    isAllWorkflowTypes,
    isSelectedWorkflowTypePending,
  } = useLibraryDetailsWorkflowRuns();

  const workflowOrcabusIds = isAllWorkflowTypes ? [] : selectedWorkflowOrcabusIds;

  const {
    portalRunId,
    workflowRunPagination,
    setWorkflowRunPage,
    setWorkflowRunRowsPerPage,
    setPortalRunId,
    workflowRunListQueryParams,
  } = useLibraryDetailsWorkflowRunsQueryParams({
    libraryOrcabusId: libraryDetail?.orcabusId,
    workflowOrcabusIds,
  });

  const {
    data: relatedWorkflowRuns,
    isLoading: isLoadingRelatedWorkflowRuns,
    isRefetching: isRefetchingRelatedWorkflowRuns,
    isError,
    error,
    refetch,
  } = useWorkflowRunListModel({
    params: {
      query: workflowRunListQueryParams,
    },
    reactQuery: {
      enabled:
        !!libraryDetail &&
        !isLoadingLibraryDetail &&
        !portalRunId &&
        !isSelectedWorkflowTypePending,
    },
  });

  const columns: Column<WorkflowRunListModel>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Run Name',
        render: (workflowRun) => (
          <button
            type='button'
            onClick={() => {
              void navigate(`/runs/workflow-runs/${workflowRun.orcabusId}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {workflowRun.workflowRunName || workflowRun.portalRunId}
          </button>
        ),
      },
      {
        key: 'portalRunId',
        header: 'Portal Run ID',
        render: (workflowRun) => (
          <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {workflowRun.portalRunId}
          </div>
        ),
      },
      {
        key: 'workflowType',
        header: 'Workflow Type',
        render: (workflowRun) => <PillTag variant='blue'>{workflowRun.workflow.name}</PillTag>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (workflowRun) => <StatusBadge status={workflowRun.currentState?.status} />,
      },
      {
        key: 'lastModified',
        header: 'Last Modified',
        render: (workflowRun) => (
          <div className='text-sm'>
            {formatTableDate(workflowRun.currentState?.timestamp ?? '')}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (workflowRun) => (
          <button
            type='button'
            onClick={() => setPortalRunId(workflowRun.portalRunId)}
            className='inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
          >
            <FileSearch className='h-3.5 w-3.5' aria-hidden='true' />
            View files
          </button>
        ),
      },
    ],
    [navigate, setPortalRunId]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetch()} />;
  }

  const emptyMessage = isAllWorkflowTypes
    ? 'No workflow runs found for this library.'
    : `No workflow runs found for ${selectedWorkflowTypeGroup?.name ?? 'this workflow type'}.`;

  return (
    <DataTable
      data={relatedWorkflowRuns?.results ?? []}
      columns={columns}
      isLoading={
        isSelectedWorkflowTypePending ||
        isLoadingRelatedWorkflowRuns ||
        isRefetchingRelatedWorkflowRuns
      }
      onRefresh={() => void refetch()}
      emptyMessage={emptyMessage}
      persistSettings={{
        key: 'library.workflowtype.workflowrunstable',
      }}
      inCard
      paginationProps={{
        page: relatedWorkflowRuns?.pagination.page ?? workflowRunPagination.page,
        pageSize: relatedWorkflowRuns?.pagination.rowsPerPage ?? DEFAULT_PAGE_SIZE,
        onPageChange: (page) => setWorkflowRunPage(page ?? 1),
        onPageSizeChange: (size) => setWorkflowRunRowsPerPage(size),
        totalItems: relatedWorkflowRuns?.pagination.count ?? 0,
      }}
    />
  );
}
