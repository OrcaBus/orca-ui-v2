import { useMemo } from 'react';
import type {
  AnalysisModel,
  ComputeContextModel,
  WorkflowModel,
} from '../../shared/api/workflows.api';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { useLastPresent } from '@/hooks/useLastPresent';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SimpleTable, type SimpleTableColumn } from '@/components/tables/SimpleTable';
import { getExecutionEnginePillVariant } from '../../shared/utils/executionEnginePill';

interface AnalysisTypeDetailsDrawerProps {
  analysisType: AnalysisModel | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDisplayVersion(version: string): string {
  const v = version.trim();
  if (!v) return '—';
  if (/^v\d/i.test(v)) return v;
  return `v${v}`;
}

/** Human-friendly usecase label (API: COMPUTE | STORAGE, etc.). */
function formatUsecase(usecase: string): string {
  return usecase.replace(/_/g, '-').toLowerCase();
}

export function AnalysisTypeDetailsDrawer({
  analysisType,
  isOpen,
  onClose,
}: AnalysisTypeDetailsDrawerProps) {
  const shown = useLastPresent(analysisType);

  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title={
        shown ? (
          <>
            {shown.analysisName}{' '}
            <span className='font-normal text-neutral-500 dark:text-neutral-400'>
              {formatDisplayVersion(shown.analysisVersion)}
            </span>
          </>
        ) : (
          ''
        )
      }
      subtitle={shown ? <span className='font-mono text-xs'>{shown.orcabusId}</span> : undefined}
      size='lg'
      closeLabel='Close analysis type details'
    >
      {shown && <AnalysisTypeDetailsBody analysisType={shown} />}
    </DrawerFrame>
  );
}

function AnalysisTypeDetailsBody({ analysisType }: { analysisType: AnalysisModel }) {
  const contexts = analysisType.contexts ?? [];
  const workflows = analysisType.workflows ?? [];

  const contextColumns = useMemo(
    (): SimpleTableColumn<ComputeContextModel>[] => [
      {
        key: 'name',
        header: 'Name',
        render: (ctx) => (
          <span className='font-semibold text-neutral-900 dark:text-slate-100'>{ctx.name}</span>
        ),
      },
      {
        key: 'usecase',
        header: 'Usecase',
        render: (ctx) => (
          <span className='text-neutral-600 dark:text-neutral-400'>
            {formatUsecase(ctx.usecase)}
          </span>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (ctx) => (
          <div
            className='max-w-md whitespace-normal text-neutral-600 dark:text-neutral-400'
            title={ctx.description ?? undefined}
          >
            {ctx.description?.trim() ? (
              <span className='line-clamp-2'>{ctx.description}</span>
            ) : (
              <span className='text-neutral-400'>—</span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (ctx) => <StatusBadge status={ctx.status} />,
      },
    ],
    []
  );

  const workflowColumns = useMemo(
    (): SimpleTableColumn<WorkflowModel>[] => [
      {
        key: 'name',
        header: 'Name',
        render: (wf) => (
          <span className='font-semibold text-neutral-900 dark:text-slate-100'>{wf.name}</span>
        ),
      },
      {
        key: 'version',
        header: 'Version',
        render: (wf) => <span className='text-neutral-800 dark:text-slate-200'>{wf.version}</span>,
      },
      {
        key: 'codeVersion',
        header: 'Code Version',
        render: (wf) => (
          <code className='font-mono text-xs text-neutral-600 dark:text-neutral-400'>
            {wf.codeVersion}
          </code>
        ),
      },
      {
        key: 'executionEngine',
        header: 'Execution Engine',
        render: (wf) => (
          <PillTag variant={getExecutionEnginePillVariant(wf.executionEngine)}>
            {wf.executionEngine}
          </PillTag>
        ),
      },
      {
        key: 'pipeline',
        header: 'Pipeline ID',
        render: (wf) => {
          const id = wf.executionEnginePipelineId;
          return (
            <span
              className='inline-block max-w-[220px] truncate font-mono text-xs text-neutral-600 dark:text-neutral-400'
              title={id ?? undefined}
            >
              {id?.trim() ? id : 'Unknown'}
            </span>
          );
        },
      },
      {
        key: 'validation',
        header: 'Validation',
        render: (wf) =>
          wf.validationState != null ? (
            <StatusBadge status={wf.validationState} />
          ) : (
            <span className='text-xs text-neutral-500 dark:text-neutral-400'>—</span>
          ),
      },
    ],
    []
  );

  return (
    <>
      {/* Summary — compact grid aligned with design */}
      <div className='mb-8 border-b border-neutral-200 pb-6 dark:border-[#2d3540]'>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <div>
            <span className='block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
              Name
            </span>
            <p className='mt-1 text-sm font-semibold text-neutral-900 dark:text-slate-100'>
              {analysisType.analysisName}
            </p>
          </div>
          <div>
            <span className='block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
              Version
            </span>
            <p className='mt-1 text-sm font-semibold text-neutral-900 dark:text-slate-100'>
              {formatDisplayVersion(analysisType.analysisVersion)}
            </p>
          </div>
          <div className='col-span-2'>
            <span className='block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
              Status
            </span>
            <div className='mt-1'>
              <StatusBadge status={analysisType.status} />
            </div>
          </div>
          <div className='col-span-2'>
            <span className='block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
              Description
            </span>
            <p className='mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300'>
              {analysisType.description?.trim() ? analysisType.description : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className='mb-8'>
        <SimpleTable
          title={`Contexts (${contexts.length})`}
          data={contexts}
          columns={contextColumns}
          rowKey={(ctx) => ctx.orcabusId}
          emptyMessage='No contexts associated with this analysis type.'
        />
      </div>

      <SimpleTable
        title={`Workflows (${workflows.length})`}
        data={workflows}
        columns={workflowColumns}
        rowKey={(wf) => wf.orcabusId}
        emptyMessage='No workflows linked to this analysis type.'
      />
    </>
  );
}
