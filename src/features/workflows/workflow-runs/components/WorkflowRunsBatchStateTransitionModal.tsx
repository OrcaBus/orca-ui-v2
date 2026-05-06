import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, ArrowLeftRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TimelineDialogFrame } from '@/components/timeline/TimelineDialogFrame';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { useAuthContext } from '@/context/auth-context';
import { cn } from '@/utils/cn';
import {
  useWorkflowRunStateCreationValidMapModel,
  useWorkflowRunsBatchStateTransitionModel,
  type WorkflowRunListModel,
} from '../../api/workflows.api';

type ValidationRule =
  | string[]
  | {
      allowed_states?: string[];
      allowedStates?: string[];
      excluded_states?: string[];
      excludedStates?: string[];
    }
  | null
  | undefined;

const batchStateTransitionSchema = z.object({
  stateName: z.string().trim().min(1, 'Please select a state'),
  comment: z
    .string()
    .trim()
    .min(1, 'Comment is required')
    .max(2000, 'Comment must be less than 2000 characters'),
});

type BatchStateTransitionFormData = z.infer<typeof batchStateTransitionSchema>;

export interface WorkflowRunsBatchStateTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowRuns: WorkflowRunListModel[];
  onSuccess?: () => void;
}

function getDefaultValues(): BatchStateTransitionFormData {
  return {
    stateName: '',
    comment: '',
  };
}

function normalizeStateValue(value?: string | null): string {
  return (value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

function formatStateLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isStateTransitionAllowed(rule: ValidationRule, currentState?: string | null): boolean {
  if (!currentState) return true;

  const currentStateKey = normalizeStateValue(currentState);

  if (Array.isArray(rule)) {
    return rule.some((state) => normalizeStateValue(state) === currentStateKey);
  }

  if (rule && typeof rule === 'object') {
    const allowedStates = rule.allowed_states ?? rule.allowedStates;
    const excludedStates = rule.excluded_states ?? rule.excludedStates;

    if (Array.isArray(allowedStates)) {
      return allowedStates.some((state) => normalizeStateValue(state) === currentStateKey);
    }

    if (Array.isArray(excludedStates)) {
      return !excludedStates.some((state) => normalizeStateValue(state) === currentStateKey);
    }
  }

  return true;
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function WorkflowRunsBatchStateTransitionModal({
  isOpen,
  onClose,
  workflowRuns,
  onSuccess,
}: WorkflowRunsBatchStateTransitionModalProps) {
  const { user } = useAuthContext();
  const firstWorkflowRunOrcabusId = workflowRuns[0]?.orcabusId ?? '';
  const workflowRunOrcabusIds = useMemo(
    () => workflowRuns.map((workflowRun) => workflowRun.orcabusId),
    [workflowRuns]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BatchStateTransitionFormData>({
    resolver: zodResolver(batchStateTransitionSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const selectedStateName = useWatch({
    control,
    name: 'stateName',
    defaultValue: '',
  });
  const selectedComment = useWatch({
    control,
    name: 'comment',
    defaultValue: '',
  });

  const {
    data: workflowRunStateCreationValidMapData,
    isLoading: isLoadingValidationMap,
    isFetching: isFetchingValidationMap,
    isError: hasValidationMapError,
    refetch: refetchValidationMap,
  } = useWorkflowRunStateCreationValidMapModel({
    params: { path: { orcabusId: firstWorkflowRunOrcabusId } },
    reactQuery: { enabled: isOpen && !!firstWorkflowRunOrcabusId },
  });

  const batchStateTransition = useWorkflowRunsBatchStateTransitionModel();

  const validationMapEntries = useMemo(
    () =>
      Object.entries(
        (workflowRunStateCreationValidMapData ?? {}) as Record<string, ValidationRule>
      ),
    [workflowRunStateCreationValidMapData]
  );

  const availableStateOptions = useMemo(
    () =>
      validationMapEntries
        .filter(([, rule]) =>
          workflowRuns.every((workflowRun) =>
            isStateTransitionAllowed(rule, workflowRun.currentState?.status)
          )
        )
        .map(([status]) => ({
          value: status,
          label: formatStateLabel(status),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [validationMapEntries, workflowRuns]
  );

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();

    workflowRuns.forEach((workflowRun) => {
      const status = workflowRun.currentState?.status ?? 'Unknown';
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });

    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [workflowRuns]);

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues());
    }
  }, [isOpen, reset, firstWorkflowRunOrcabusId]);

  useEffect(() => {
    if (
      selectedStateName &&
      !availableStateOptions.some((option) => option.value === selectedStateName)
    ) {
      setValue('stateName', '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [availableStateOptions, selectedStateName, setValue]);

  const handleClose = () => {
    reset(getDefaultValues());
    onClose();
  };

  const handleFormSubmit = async (data: BatchStateTransitionFormData) => {
    if (!workflowRunOrcabusIds.length) {
      toast.error('Select at least one workflow run');
      return;
    }

    try {
      const result = await batchStateTransition.mutateAsync({
        body: {
          workflowrunOrcabusIds: workflowRunOrcabusIds,
          status: data.stateName,
          comment: data.comment,
        },
      });

      const createdCount = result?.createdCount ?? workflowRunOrcabusIds.length;
      toast.success(
        `Created ${createdCount} state ${pluralize(createdCount, 'transition')} successfully`
      );
      onSuccess?.();
      handleClose();
    } catch {
      toast.error('Failed to transition workflow runs');
    }
  };

  const isValidationMapLoading = isLoadingValidationMap || isFetchingValidationMap;
  const hasSelectedWorkflowRuns = workflowRunOrcabusIds.length > 0;
  const hasSelectableStates = availableStateOptions.length > 0;
  const isSubmitDisabled =
    isSubmitting ||
    isValidationMapLoading ||
    hasValidationMapError ||
    !hasSelectedWorkflowRuns ||
    !hasSelectableStates ||
    selectedStateName.trim().length === 0 ||
    selectedComment.trim().length === 0;

  return (
    <TimelineDialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title='Batch State Transition'
      icon={<ArrowLeftRight className='h-5 w-5' />}
      actorEmail={user?.email}
      footer={
        <>
          <button
            type='button'
            onClick={handleClose}
            className={cn(
              'rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            )}
          >
            Close
          </button>
          <button
            type='submit'
            form='workflow-runs-batch-state-transition-form'
            disabled={isSubmitDisabled}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
              'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
            )}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />}
            {isSubmitting ? 'Transitioning...' : 'Transition Runs'}
          </button>
        </>
      }
    >
      <form
        id='workflow-runs-batch-state-transition-form'
        onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}
        className='space-y-5'
      >
        <div className='rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='text-sm font-semibold text-neutral-900 dark:text-slate-100'>
              Selected workflow runs
            </h3>
            <span className='shrink-0 text-xs font-medium text-neutral-500 dark:text-[#9dabb9]'>
              {workflowRuns.length} {pluralize(workflowRuns.length, 'run')}
            </span>
          </div>

          {statusCounts.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {statusCounts.map(([status, count]) => (
                <span
                  key={status}
                  className='rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 dark:border-[#2d3540] dark:bg-[#111418] dark:text-slate-200'
                >
                  {formatStateLabel(status)}: {count}
                </span>
              ))}
            </div>
          )}

          {workflowRuns.length > 0 ? (
            <div className='mt-3 max-h-36 space-y-2 overflow-y-auto pr-1'>
              {workflowRuns.map((workflowRun) => (
                <div
                  key={workflowRun.orcabusId}
                  className='rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-[#2d3540] dark:bg-[#111418]'
                >
                  <div className='truncate text-sm font-medium text-neutral-900 dark:text-slate-100'>
                    {workflowRun.workflowRunName || workflowRun.portalRunId}
                  </div>
                  <div className='mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-[#9dabb9]'>
                    <span>{workflowRun.workflow.name}</span>
                    <span>{workflowRun.currentState?.status ?? 'Unknown'}</span>
                    <span className='font-mono'>{workflowRun.orcabusId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='mt-3 text-sm font-medium text-red-600 dark:text-red-400'>
              Select at least one workflow run.
            </p>
          )}
        </div>

        {isValidationMapLoading ? (
          <div className='min-h-36 rounded-md border border-neutral-200 dark:border-[#2d3540]'>
            <SpinnerWithText text='Loading state transitions...' />
          </div>
        ) : hasValidationMapError ? (
          <div className='rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium text-red-700 dark:text-red-400'>
                  State transition validation could not be loaded.
                </p>
                <button
                  type='button'
                  onClick={() => void refetchValidationMap()}
                  className='mt-2 text-sm font-medium text-red-700 underline-offset-2 hover:underline dark:text-red-300'
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : hasSelectableStates ? (
          <div className='space-y-3'>
            <input type='hidden' {...register('stateName')} />
            <p className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Target state
            </p>
            <div className='space-y-2'>
              {availableStateOptions.map((state) => {
                const isSelected = selectedStateName === state.value;

                return (
                  <button
                    key={state.value}
                    type='button'
                    onClick={() =>
                      setValue('stateName', state.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 h-4 w-4 rounded-full border',
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-neutral-300',
                        'dark:border-[#2d3540]'
                      )}
                    />
                    <span className='font-medium text-neutral-900 dark:text-slate-100'>
                      {state.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.stateName && (
              <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                {errors.stateName.message}
              </p>
            )}
          </div>
        ) : (
          <p className='rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            No valid target states are available for all selected workflow runs.
          </p>
        )}

        <div className='space-y-2'>
          <label
            htmlFor='batch-state-transition-comment'
            className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            Comment
          </label>
          <textarea
            id='batch-state-transition-comment'
            rows={5}
            {...register('comment')}
            placeholder='Write your state comment here...'
            className='min-h-[140px] w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {errors.comment && (
            <p className='text-sm font-medium text-red-500 dark:text-red-400'>
              {errors.comment.message}
            </p>
          )}
        </div>
      </form>
    </TimelineDialogFrame>
  );
}

export default WorkflowRunsBatchStateTransitionModal;
