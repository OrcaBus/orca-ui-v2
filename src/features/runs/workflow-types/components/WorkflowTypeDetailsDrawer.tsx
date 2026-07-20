import { WorkflowListModel, WorkflowHistoryModel } from '../../shared/api/workflows.api';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { useLastPresent } from '@/hooks/useLastPresent';
import { PillTag } from '@/components/ui/PillTag';
import { getExecutionEnginePillVariant } from '../../shared/utils/executionEnginePill';
import { SimpleTable, type SimpleTableColumn } from '@/components/tables/SimpleTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface WorkflowTypeDetailsDrawerProps {
  workflowType: WorkflowListModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowTypeDetailsDrawer({
  workflowType,
  isOpen,
  onClose,
}: WorkflowTypeDetailsDrawerProps) {
  const shown = useLastPresent(workflowType);

  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title={shown?.name ?? ''}
      size='xl'
      bodyClassName='p-0'
      closeLabel='Close workflow type details'
    >
      {shown && <WorkflowTypeDetailsBody workflowType={shown} />}
    </DrawerFrame>
  );
}

function WorkflowTypeDetailsBody({ workflowType }: { workflowType: WorkflowListModel }) {
  const getExecutionEnginePill = (engine: WorkflowListModel['executionEngine']) => (
    <PillTag variant={getExecutionEnginePillVariant(engine)}>{engine}</PillTag>
  );

  const historyColumns: SimpleTableColumn<WorkflowHistoryModel>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (entry) => (
        <span className='text-sm font-medium text-neutral-900 dark:text-slate-200'>
          {entry.name}
        </span>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      render: (entry) => (
        <span className='text-sm font-medium text-neutral-900 dark:text-slate-200'>
          {entry.version}
        </span>
      ),
    },
    {
      key: 'codeVersion',
      header: 'Code',
      render: (entry) => (
        <span className='font-mono text-xs text-neutral-600 dark:text-neutral-400'>
          {entry.codeVersion}
        </span>
      ),
    },
    {
      key: 'executionEngine',
      header: 'Engine',
      render: (entry) => getExecutionEnginePill(entry.executionEngine),
    },
    {
      key: 'validationState',
      header: 'Status',
      render: (entry) => <StatusBadge status={entry.validationState} />,
    },
  ];

  return (
    <>
      {/* Workflow Summary */}
      <div className='border-b border-neutral-200 px-6 py-5 dark:border-[#2d3540]'>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <div>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Orcabus ID
            </span>
            <span className='mt-0.5 block font-mono text-sm font-semibold text-neutral-900 dark:text-slate-200'>
              {workflowType.orcabusId}
            </span>
          </div>
          <div>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Current Version
            </span>
            <span className='mt-0.5 block text-sm font-semibold text-neutral-900 dark:text-slate-200'>
              {workflowType.version}
            </span>
          </div>

          <div>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Execution Engine
            </span>
            <div className='mt-1'>{getExecutionEnginePill(workflowType.executionEngine)}</div>
          </div>
          <div>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Code Version
            </span>
            <span className='mt-0.5 block font-mono text-sm text-neutral-700 dark:text-neutral-300'>
              {workflowType.codeVersion}
            </span>
          </div>

          <div className='col-span-2'>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Pipeline ID
            </span>
            <span className='mt-0.5 block font-mono text-sm text-neutral-700 dark:text-neutral-300'>
              {workflowType.executionEnginePipelineId ?? '—'}
            </span>
          </div>

          <div className='col-span-2'>
            <span className='block text-xs font-medium text-neutral-500 dark:text-neutral-400'>
              Validation State
            </span>
            <div className='mt-1'>
              <StatusBadge status={workflowType.validationState} />
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className='px-6 py-6'>
        <SimpleTable
          title='Version History'
          data={workflowType.history ?? []}
          rowKey={(entry) => entry.orcabusId}
          emptyMessage='No history available.'
          columns={historyColumns}
        />
      </div>
    </>
  );
}
