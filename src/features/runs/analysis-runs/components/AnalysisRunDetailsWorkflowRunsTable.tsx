import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';
import {
  useAnalysisRunDetailsWorkflowRunsQueryParams,
  type AnalysisRunWorkflowRunStatus,
} from '../hooks/useAnalysisRunDetailsWorkflowRunsQueryParams';
import { useWorkflowRunListModel, type WorkflowRunListModel } from '../../shared/api/workflows.api';
import { FilterBar } from '@/components/tables/FilterBar';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { PillTag } from '@/components/ui/PillTag';

export function AnalysisRunDetailsWorkflowRunsTable() {
  const navigate = useNavigate();
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();

  const analysisRunOrcabusId = analysisRunDetail?.orcabusId ?? '';
  const { search, workflowRunsQueryParams, setPage, setRowsPerPage, setSearchQuery } =
    useAnalysisRunDetailsWorkflowRunsQueryParams(analysisRunOrcabusId);
  const {
    data: analysisRunWorkflowRuns,
    isLoading: isLoadingAnalysisRunWorkflowRuns,
    isError: isErrorAnalysisRunWorkflowRuns,
    error: errorAnalysisRunWorkflowRuns,
    refetch: refetchAnalysisRunWorkflowRuns,
  } = useWorkflowRunListModel({
    params: {
      query: workflowRunsQueryParams,
    },
  });

  const columns: Column<WorkflowRunListModel>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Run Name',
        sortable: true,
        render: (wf) => (
          <Button
            variant='ghost'
            size='inline'
            onClick={() => {
              void navigate(`/runs/workflow-runs/${wf.orcabusId}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {wf.workflowRunName}
          </Button>
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
          const status = (
            wf.currentState?.status as string
          )?.toLowerCase() as AnalysisRunWorkflowRunStatus;
          return <StatusBadge status={status} />;
        },
      },
      {
        key: 'lastModified',
        header: 'Last Modified',
        sortable: true,
        render: (wf) => (
          <div className='text-sm'>{formatTableDate(wf.currentState?.timestamp ?? '')}</div>
        ),
      },
    ],
    [navigate]
  );

  if (isErrorAnalysisRunWorkflowRuns) {
    return (
      <ApiErrorState
        error={errorAnalysisRunWorkflowRuns}
        onRetry={() => void refetchAnalysisRunWorkflowRuns()}
      />
    );
  }

  return (
    <>
      <FilterBar
        searchValue={search || ''}
        onSearchChange={(search) => setSearchQuery(search)}
        searchPlaceholder='Search by Library ID, project...'
      />

      <DataTable
        data={analysisRunWorkflowRuns?.results || []}
        columns={columns}
        isLoading={isLoadingAnalysisRunDetail || isLoadingAnalysisRunWorkflowRuns}
        selectable
        onRefresh={() => void refetchAnalysisRunWorkflowRuns()}
        emptyMessage='No workflow runs found'
        paginationProps={{
          page: analysisRunWorkflowRuns?.pagination.page || 1,
          pageSize: analysisRunWorkflowRuns?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: analysisRunWorkflowRuns?.pagination.count || 0,
        }}
      />
    </>
  );
}
