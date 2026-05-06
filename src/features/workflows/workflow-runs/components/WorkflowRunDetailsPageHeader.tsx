import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';
import {
  useWorkflowRunRerunModel,
  useWorkflowRunStateCreateModel,
  type DatasetEnum,
} from '../../api/workflows.api';
import { WorkflowRunRerunModal, type RerunFormValues } from './WorkflowRunRerunModal';

export function WorkflowRunDetailsPageHeader() {
  const { workflowRunDetail, isLoadingWorkflowRunDetail, workflowRunRerunValidMapData, refresh } =
    useWorkflowRunDetailsContext();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRerunModalOpen, setIsRerunModalOpen] = useState(false);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const rerunMutation = useWorkflowRunRerunModel();
  const createStateMutation = useWorkflowRunStateCreateModel();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleOpenRerunModal = () => {
    rerunMutation.reset();
    createStateMutation.reset();
    setIsRerunModalOpen(true);
  };

  const handleCloseRerunModal = () => {
    setIsRerunModalOpen(false);
    rerunMutation.reset();
    createStateMutation.reset();
  };

  const handleRerunSubmit = async (values: RerunFormValues) => {
    const orcabusId = workflowRunDetail?.orcabusId;
    if (!orcabusId) throw new Error('Missing orcabusId');

    await rerunMutation.mutateAsync({
      params: { path: { orcabusId } },
      body: {
        allowDuplication: false,
        dataset: values.dataset as DatasetEnum,
      },
    });

    if (values.markAsDeprecated) {
      await createStateMutation.mutateAsync({
        params: { path: { orcabusId } },
        body: {
          status: 'DEPRECATED',
          comment: 'Marked as deprecated due to workflow rerun.',
        },
      });
    }

    refresh();
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const displayName =
    workflowRunDetail?.workflowRunName ?? workflowRunDetail?.workflow?.name ?? '—';
  const status = workflowRunDetail?.currentState?.status ?? 'unknown';

  return (
    <div className='mb-6'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          {isLoadingWorkflowRunDetail ? (
            <>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </>
          ) : (
            <>
              <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
                {displayName}
              </h1>
              <StatusBadge status={status} size='md' />
            </>
          )}
        </div>

        {/* Rerun button */}
        {!isLoadingWorkflowRunDetail && (
          <button
            type='button'
            onClick={handleOpenRerunModal}
            className='flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600 dark:focus:ring-offset-[#111418]'
          >
            <RefreshCw className='h-4 w-4' />
            Rerun Workflow
          </button>
        )}
      </div>

      {/* Key Identifiers */}
      <div className='flex flex-wrap items-center gap-6 text-sm'>
        {/* Orcabus ID */}
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Orcabus ID:</span>
          {isLoadingWorkflowRunDetail ? (
            <Skeleton className='h-4 w-40' />
          ) : (
            <span className='font-mono text-neutral-900 dark:text-neutral-100'>
              {workflowRunDetail?.orcabusId ?? '—'}
            </span>
          )}
        </div>

        {/* Portal Run ID */}
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Portal Run ID:</span>
          {isLoadingWorkflowRunDetail ? (
            <Skeleton className='h-4 w-40' />
          ) : (
            <>
              <span className='font-mono text-neutral-900 dark:text-neutral-100'>
                {workflowRunDetail?.portalRunId ?? '—'}
              </span>
              {workflowRunDetail?.portalRunId && (
                <button
                  type='button'
                  onClick={() => void handleCopy(workflowRunDetail.portalRunId, 'portal-run-id')}
                  className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  aria-label='Copy Portal Run ID'
                >
                  {copiedId === 'portal-run-id' ? (
                    <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                  ) : (
                    <Copy className='h-4 w-4 text-neutral-400' />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <WorkflowRunRerunModal
        isOpen={isRerunModalOpen}
        onClose={handleCloseRerunModal}
        onSubmit={handleRerunSubmit}
        workflowRunName={displayName}
        workflowName={workflowRunDetail?.workflow?.name ?? ''}
        isValid={workflowRunRerunValidMapData?.isValid ?? false}
        allowedDatasetChoice={workflowRunRerunValidMapData?.allowedDatasetChoice ?? []}
        validWorkflows={workflowRunRerunValidMapData?.validWorkflows ?? []}
      />
    </div>
  );
}
