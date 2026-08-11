import type { WorkflowRunStateTransitionRequestModel } from '../../shared/api/workflows.api';

export type WorkflowRunStateTransition = 'CANCELLED' | 'DEPRECATED' | 'RESOLVED';

export type WorkflowRunStateValidationRule =
  | string[]
  | {
      allowed_states?: string[];
      allowedStates?: string[];
      excluded_states?: string[];
      excludedStates?: string[];
    }
  | null
  | undefined;

export type WorkflowRunStateValidationMap = Record<string, WorkflowRunStateValidationRule>;

type WorkflowRunStateTransitionHandler<TResult> = (
  request: WorkflowRunStateTransitionRequestModel
) => Promise<TResult>;

export type WorkflowRunStateTransitionHandlers<TResult> = Record<
  WorkflowRunStateTransition,
  WorkflowRunStateTransitionHandler<TResult>
>;

export interface WorkflowRunStateTransitionOption {
  value: WorkflowRunStateTransition;
  label: string;
}

export interface WorkflowRunStateTransitionFeedback {
  type: 'success' | 'warning';
  message: string;
}

const SUPPORTED_WORKFLOW_RUN_STATE_TRANSITIONS = new Set<WorkflowRunStateTransition>([
  'CANCELLED',
  'DEPRECATED',
  'RESOLVED',
]);

export function normalizeWorkflowRunState(value?: string | null): string {
  return (value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

export function formatWorkflowRunStateLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSupportedWorkflowRunStateTransition(value: string): value is WorkflowRunStateTransition {
  return SUPPORTED_WORKFLOW_RUN_STATE_TRANSITIONS.has(value as WorkflowRunStateTransition);
}

function isTransitionAllowed(
  rule: WorkflowRunStateValidationRule,
  currentState?: string | null
): boolean {
  const currentStateKey = normalizeWorkflowRunState(currentState);

  if (Array.isArray(rule)) {
    return rule.some((state) => normalizeWorkflowRunState(state) === currentStateKey);
  }

  if (rule && typeof rule === 'object') {
    const allowedStates = rule.allowed_states ?? rule.allowedStates;
    const excludedStates = rule.excluded_states ?? rule.excludedStates;

    if (Array.isArray(allowedStates)) {
      return allowedStates.some((state) => normalizeWorkflowRunState(state) === currentStateKey);
    }

    if (Array.isArray(excludedStates)) {
      return !excludedStates.some((state) => normalizeWorkflowRunState(state) === currentStateKey);
    }
  }

  return true;
}

function findValidationRule(
  validationMap: WorkflowRunStateValidationMap,
  transition: WorkflowRunStateTransition
): WorkflowRunStateValidationRule {
  const entry = Object.entries(validationMap).find(
    ([state]) => normalizeWorkflowRunState(state) === transition
  );

  return entry?.[1];
}

export function isWorkflowRunStateTransitionAvailable(
  validationMap: WorkflowRunStateValidationMap | null | undefined,
  transition: WorkflowRunStateTransition,
  currentState?: string | null
): boolean {
  if (!validationMap) return false;

  const rule = findValidationRule(validationMap, transition);
  if (rule === undefined) return false;
  if (!currentState) return transition === 'DEPRECATED';

  return isTransitionAllowed(rule, currentState);
}

export function getAvailableWorkflowRunStateTransitions(
  validationMap: WorkflowRunStateValidationMap | null | undefined,
  currentStates: Array<string | null | undefined>
): WorkflowRunStateTransitionOption[] {
  if (!validationMap) return [];

  return Object.keys(validationMap)
    .map(normalizeWorkflowRunState)
    .filter(isSupportedWorkflowRunStateTransition)
    .filter((transition) =>
      currentStates.every((currentState) =>
        isWorkflowRunStateTransitionAvailable(validationMap, transition, currentState)
      )
    )
    .map((transition) => ({
      value: transition,
      label: formatWorkflowRunStateLabel(transition),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function dispatchWorkflowRunStateTransition<TResult>(
  state: string,
  request: WorkflowRunStateTransitionRequestModel,
  handlers: WorkflowRunStateTransitionHandlers<TResult>
): Promise<TResult> {
  const transition = normalizeWorkflowRunState(state);

  if (!isSupportedWorkflowRunStateTransition(transition)) {
    return Promise.reject(
      new Error(`Unsupported workflow-run state transition: ${transition || state}`)
    );
  }

  return handlers[transition](request);
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

function getFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getWorkflowRunStateTransitionCounts(result: unknown): {
  createdCount: number;
  failedCount: number;
} {
  if (!result || typeof result !== 'object') {
    return { createdCount: 0, failedCount: 0 };
  }

  const payload = result as Record<string, unknown>;
  return {
    createdCount: getFiniteNumber(payload.createdCount) ?? 0,
    failedCount: getFiniteNumber(payload.failedCount) ?? 0,
  };
}

export function getWorkflowRunStateTransitionFeedback(
  result: unknown
): WorkflowRunStateTransitionFeedback {
  const { createdCount, failedCount } = getWorkflowRunStateTransitionCounts(result);
  const transitionLabel = pluralize(createdCount, 'transition');

  if (failedCount > 0) {
    return {
      type: 'warning',
      message: `Created ${createdCount} state ${transitionLabel}; ${failedCount} failed`,
    };
  }

  return {
    type: 'success',
    message: `Created ${createdCount} state ${transitionLabel} successfully`,
  };
}
