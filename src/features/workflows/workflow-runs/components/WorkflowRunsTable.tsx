import {
  Column,
  DataTable,
  type DataTableActionContext,
  type DataTableToolbarAction,
} from '@/components/tables/DataTable';
import {
  useWorkflowRunListQueryParams,
  WorkflowRunStatus,
} from '../hooks/useWorkflowRunListQueryParams';
import { useWorkflowRunListModel, type WorkflowRunListModel } from '../../api/workflows.api';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { ArrowLeftRight } from 'lucide-react';
import WorkflowRunsBatchStateTransitionModal from './WorkflowRunsBatchStateTransitionModal';

interface WorkflowRunsTableProps {
  onBatchStateTransitionSuccess?: () => void;
}

const WorkflowRunsTable = ({ onBatchStateTransitionSuccess }: WorkflowRunsTableProps) => {
  const navigate = useNavigate();
  const { workflowRunListQueryParams, setPage, setRowsPerPage } = useWorkflowRunListQueryParams();
  const [isBatchStateTransitionModalOpen, setIsBatchStateTransitionModalOpen] = useState(false);
  const [batchStateTransitionWorkflowRuns, setBatchStateTransitionWorkflowRuns] = useState<
    WorkflowRunListModel[]
  >([]);

  const {
    data: workflowRuns,
    isLoading: isLoadingWorkflowRuns,
    isRefetching: isRefetchingWorkflowRuns,
    isError,
    error,
    refetch: refetchWorkflowRuns,
  } = useWorkflowRunListModel({
    params: {
      query: {
        ...workflowRunListQueryParams,
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
              void navigate(`/workflows/workflow-runs/${wf.orcabusId}`);
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
          <div className='text-sm'>{formatTableDate(wf.currentState?.timestamp ?? '')}</div>
        ),
      },
    ],
    [navigate]
  );

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetchWorkflowRuns()} />;
  }

  const handleBatchStateTransition = (context: DataTableActionContext<WorkflowRunListModel>) => {
    const selectedRuns = context.selectedRows;
    setBatchStateTransitionWorkflowRuns(selectedRuns);
    setIsBatchStateTransitionModalOpen(true);
  };

  const toolbarActions: DataTableToolbarAction<WorkflowRunListModel>[] = [
    {
      id: 'batch-states-transition',
      label: 'Batch State Transition',
      icon: <ArrowLeftRight className='h-4 w-4' />,
      onClick: handleBatchStateTransition,
      disabled: ({ selectedRows }) => selectedRows.length === 0,
    },
  ];

  return (
    <>
      <DataTable
        data={workflowRuns?.results || []}
        columns={columns}
        isLoading={isLoadingWorkflowRuns || isRefetchingWorkflowRuns}
        selectable
        onRefresh={() => void refetchWorkflowRuns()}
        emptyMessage='No workflow runs found'
        toolbarActions={toolbarActions}
        paginationProps={{
          page: workflowRuns?.pagination.page || 1,
          pageSize: workflowRuns?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: workflowRuns?.pagination.count || 0,
        }}
      />
      <WorkflowRunsBatchStateTransitionModal
        isOpen={isBatchStateTransitionModalOpen}
        onClose={() => setIsBatchStateTransitionModalOpen(false)}
        workflowRuns={batchStateTransitionWorkflowRuns}
        onSuccess={() => {
          void refetchWorkflowRuns();
          onBatchStateTransitionSuccess?.();
        }}
      />
    </>
  );
};

export default WorkflowRunsTable;
