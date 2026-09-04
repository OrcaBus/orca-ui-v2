import { useMemo } from 'react';
import { CheckCircle, Circle, PlayCircle, type LucideIcon } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { FAMILY_ACCENT, getStatusFamily } from '@/components/ui/status-config';
import { formatShortDate } from '@/utils/timeFormat';
import { cn } from '@/utils/cn';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { deriveCaseLifecycleHistory } from '../utils/caseLifecycleHistory';
import { CASE_STATUS_LABELS } from '../utils/caseStatus.visuals';
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_ORDER,
  getLifecycleStageFamily,
  resolveCaseLifecyclePosition,
  type LifecycleStage,
} from '../utils/caseStatusRegistry';

type StepState = 'complete' | 'current' | 'not-yet-reached';

const STEP_STATE_ARIA_LABEL: Record<StepState, string> = {
  complete: 'complete',
  current: 'current',
  'not-yet-reached': 'not yet reached',
};

const STEP_STATE_ICON: Record<StepState, LucideIcon> = {
  complete: CheckCircle,
  current: PlayCircle,
  'not-yet-reached': Circle,
};

function stepIconAccent(stage: LifecycleStage, state: StepState): string {
  if (state === 'not-yet-reached') return FAMILY_ACCENT.neutral;
  return FAMILY_ACCENT[getLifecycleStageFamily(stage)];
}

interface StepProps {
  stage: LifecycleStage;
  state: StepState;
  /** Reached timestamp for steps at or before the current position; omitted otherwise. */
  timestamp?: string;
  /** Whether the connector segment leading into this step (from the previous step) is filled. */
  leftConnectorFilled: boolean;
  /** Whether the connector segment leading out of this step (to the next step) is filled. */
  rightConnectorFilled: boolean;
  /** False for the first step, to suppress the leading connector half. */
  showLeftConnector: boolean;
  /** False for the last step, to suppress the trailing connector half. */
  showRightConnector: boolean;
}

function LifecycleStep({
  stage,
  state,
  timestamp,
  leftConnectorFilled,
  rightConnectorFilled,
  showLeftConnector,
  showRightConnector,
}: StepProps) {
  const label = LIFECYCLE_STAGE_LABELS[stage];
  const Icon = STEP_STATE_ICON[state];
  const isCurrent = state === 'current';

  return (
    <li
      tabIndex={0}
      aria-label={`${label}, ${STEP_STATE_ARIA_LABEL[state]}`}
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'group relative flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 rounded-md py-1.5 outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500'
      )}
    >
      <div className='relative flex h-7 w-full items-center justify-center'>
        {showLeftConnector && (
          <span
            className={cn(
              'absolute top-1/2 right-1/2 left-0 h-0.5 -translate-y-1/2',
              leftConnectorFilled
                ? 'bg-neutral-400 dark:bg-neutral-500'
                : 'bg-neutral-200 dark:bg-neutral-700'
            )}
            aria-hidden='true'
          />
        )}
        {showRightConnector && (
          <span
            className={cn(
              'absolute top-1/2 right-0 left-1/2 h-0.5 -translate-y-1/2',
              rightConnectorFilled
                ? 'bg-neutral-400 dark:bg-neutral-500'
                : 'bg-neutral-200 dark:bg-neutral-700'
            )}
            aria-hidden='true'
          />
        )}
        <span
          className={cn(
            'z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#111418]',
            isCurrent &&
              'ring-2 ring-current ring-offset-1 ring-offset-white dark:ring-offset-[#111418]',
            stepIconAccent(stage, state)
          )}
        >
          <Icon className='h-5 w-5 shrink-0' aria-hidden='true' />
        </span>
      </div>
      <span
        className={cn(
          'flex flex-col text-center text-sm leading-tight',
          isCurrent
            ? 'font-semibold text-neutral-900 dark:text-white'
            : state === 'complete'
              ? 'text-neutral-700 dark:text-neutral-300'
              : 'text-neutral-500 dark:text-[#9dabb9]'
        )}
      >
        {label.split(' ').map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </span>
      <span className='text-center text-xs whitespace-nowrap text-neutral-500 dark:text-[#9dabb9]'>
        {timestamp ? formatShortDate(timestamp) : '\u00A0'}
      </span>
    </li>
  );
}

const SKELETON_STEP_COUNT = LIFECYCLE_STAGE_ORDER.length;

function LifecycleStepperSkeleton() {
  return (
    <div className='flex items-center gap-2'>
      {Array.from({ length: SKELETON_STEP_COUNT }).map((_, index) => (
        <Skeleton key={index} className='h-14 flex-1 rounded-md' />
      ))}
    </div>
  );
}

export function LifecycleStepper() {
  const { caseDetail, isLoadingCaseDetail, caseStatesData } = useCaseDetailsContext();

  const { statusHistory, stageTimestamps } = useMemo(
    () => deriveCaseLifecycleHistory(caseStatesData),
    [caseStatesData]
  );

  const { isOffStepper, maxPosition, isReworking } = useMemo(
    () => resolveCaseLifecyclePosition(statusHistory),
    [statusHistory]
  );

  const offStepperStatus =
    isOffStepper && statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : undefined;

  const isLoading = isLoadingCaseDetail && !caseDetail;

  const currentStageLabel = useMemo(() => {
    if (maxPosition === null) return 'Not started';
    return LIFECYCLE_STAGE_LABELS[LIFECYCLE_STAGE_ORDER[maxPosition]];
  }, [maxPosition]);

  return (
    <div className='mt-4'>
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className='flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left dark:border-neutral-700 dark:bg-[#111418]'>
          <span className='flex items-center gap-2 text-sm text-neutral-600 dark:text-[#9dabb9]'>
            <span className='font-medium text-neutral-500 uppercase dark:text-[#9dabb9]'>
              Lifecycle
            </span>
            <span className='font-semibold text-neutral-900 dark:text-white'>
              {isLoading ? '—' : currentStageLabel}
            </span>
            {offStepperStatus && (
              <PillTag
                variant={getStatusFamily(offStepperStatus) === 'error' ? 'red' : 'amber'}
                size='sm'
              >
                {`Off track: ${CASE_STATUS_LABELS[offStepperStatus]}`}
              </PillTag>
            )}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className='rounded-b-lg border border-t-0 border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-[#111418]'>
          {isLoading ? (
            <LifecycleStepperSkeleton />
          ) : (
            <div className='flex flex-col gap-3'>
              <ol className='flex items-start overflow-x-auto'>
                {LIFECYCLE_STAGE_ORDER.map((stage, index) => {
                  let state: StepState;
                  if (maxPosition === null) {
                    state = 'not-yet-reached';
                  } else if (index < maxPosition) {
                    state = 'complete';
                  } else if (index === maxPosition) {
                    state = isOffStepper || isReworking ? 'complete' : 'current';
                  } else {
                    state = 'not-yet-reached';
                  }

                  const showTimestamp = maxPosition !== null && index <= maxPosition;

                  return (
                    <LifecycleStep
                      key={stage}
                      stage={stage}
                      state={state}
                      timestamp={showTimestamp ? stageTimestamps[stage] : undefined}
                      showLeftConnector={index > 0}
                      showRightConnector={index < LIFECYCLE_STAGE_ORDER.length - 1}
                      leftConnectorFilled={maxPosition !== null && index <= maxPosition}
                      rightConnectorFilled={maxPosition !== null && index < maxPosition}
                    />
                  );
                })}
              </ol>
              {offStepperStatus && (
                <div className='flex items-center justify-center'>
                  <PillTag
                    variant={getStatusFamily(offStepperStatus) === 'error' ? 'red' : 'amber'}
                    size='sm'
                  >
                    {`Off track: ${CASE_STATUS_LABELS[offStepperStatus]}`}
                  </PillTag>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
