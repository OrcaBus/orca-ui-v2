import { SimpleTable, SimpleTableColumn } from '@/components/tables/SimpleTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PillTag } from '@/components/ui/PillTag';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';
import type { RunContext as WorkflowRunContext } from '@/features/runs/shared/api/workflows.api';

export function WorkflowRunDetailsRunContextTable() {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();
  const runContexts = workflowRunDetail?.contexts || [];

  const columns: SimpleTableColumn<WorkflowRunContext>[] = [
    {
      key: 'name',
      header: 'Context Name',
      render: (ctx) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{ctx.name}</span>
      ),
    },
    {
      key: 'usecase',
      header: 'Use Case',
      render: (ctx) => <PillTag variant='blue'>{ctx.usecase}</PillTag>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (ctx) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {ctx.description || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ctx) => <StatusBadge status={ctx.status} />,
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={runContexts}
      emptyMessage='No run context data available'
      isLoading={isLoadingWorkflowRunDetail}
    />
  );
}
