/**
 * Request body of `POST /sequence_run/state/{deprecate,resolve}/`
 * (`StateTransitionRequestRequest` in the generated schema). Declared here so
 * callers get a concrete type instead of one inferred through the generated
 * multi-content-type request union.
 */
export interface SequenceRunStateTransitionRequest {
  sequenceRunOrcabusIds: string[];
  comment: string;
}

/** One per-run failure entry (`StateTransitionFailure`). */
export interface SequenceRunStateTransitionFailure {
  sequenceRunOrcabusId: string;
  reason: string;
  detail: string;
}

/**
 * Body returned by a transition endpoint on 201 and 207
 * (`StateTransitionResponse`).
 */
export interface SequenceRunStateTransitionResult {
  createdCount: number;
  sequenceRunOrcabusIds: string[];
  failedCount: number;
  failures?: SequenceRunStateTransitionFailure[];
}

/**
 * Transitions the sequence-run manager exposes as dedicated endpoints
 * (`POST /sequence_run/state/{deprecate,resolve}/`). The endpoint determines
 * the target state, so only these two states can be requested from the UI.
 */
export type SequenceRunStateTransition = 'DEPRECATED' | 'RESOLVED';

export type SequenceRunStateValidationRule =
  | string[]
  | {
      allowed_states?: string[];
      allowedStates?: string[];
      excluded_states?: string[];
      excludedStates?: string[];
    }
  | null
  | undefined;

export type SequenceRunStateValidationMap = Record<string, SequenceRunStateValidationRule>;

type SequenceRunStateTransitionHandler<TResult> = (
  request: SequenceRunStateTransitionRequest
) => Promise<TResult>;

export type SequenceRunStateTransitionHandlers<TResult> = Record<
  SequenceRunStateTransition,
  SequenceRunStateTransitionHandler<TResult>
>;

export interface SequenceRunStateTransitionOption {
  value: SequenceRunStateTransition;
  label: string;
}

export interface SequenceRunStateTransitionFeedback {
  type: 'success' | 'warning';
  message: string;
}

const SUPPORTED_SEQUENCE_RUN_STATE_TRANSITIONS = new Set<SequenceRunStateTransition>([
  'DEPRECATED',
  'RESOLVED',
]);

export function normalizeSequenceRunState(value?: string | null): string {
  return (value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

export function formatSequenceRunStateLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSupportedSequenceRunStateTransition(value: string): value is SequenceRunStateTransition {
  return SUPPORTED_SEQUENCE_RUN_STATE_TRANSITIONS.has(value as SequenceRunStateTransition);
}

function isTransitionAllowed(
  rule: SequenceRunStateValidationRule,
  currentState?: string | null
): boolean {
  const currentStateKey = normalizeSequenceRunState(currentState);

  if (Array.isArray(rule)) {
    return rule.some((state) => normalizeSequenceRunState(state) === currentStateKey);
  }

  if (rule && typeof rule === 'object') {
    const allowedStates = rule.allowed_states ?? rule.allowedStates;
    const excludedStates = rule.excluded_states ?? rule.excludedStates;

    if (Array.isArray(allowedStates)) {
      return allowedStates.some((state) => normalizeSequenceRunState(state) === currentStateKey);
    }

    if (Array.isArray(excludedStates)) {
      return !excludedStates.some((state) => normalizeSequenceRunState(state) === currentStateKey);
    }
  }

  return true;
}

function findValidationRule(
  validationMap: SequenceRunStateValidationMap,
  transition: SequenceRunStateTransition
): SequenceRunStateValidationRule {
  const entry = Object.entries(validationMap).find(
    ([state]) => normalizeSequenceRunState(state) === transition
  );

  return entry?.[1];
}

export function isSequenceRunStateTransitionAvailable(
  validationMap: SequenceRunStateValidationMap | null | undefined,
  transition: SequenceRunStateTransition,
  currentState?: string | null
): boolean {
  if (!validationMap) return false;

  const rule = findValidationRule(validationMap, transition);
  if (rule === undefined) return false;
  // A sequence run without a state can only be deprecated (matches the backend).
  if (!currentState) return transition === 'DEPRECATED';

  return isTransitionAllowed(rule, currentState);
}

export function getAvailableSequenceRunStateTransitions(
  validationMap: SequenceRunStateValidationMap | null | undefined,
  currentStates: Array<string | null | undefined>
): SequenceRunStateTransitionOption[] {
  if (!validationMap) return [];

  return Object.keys(validationMap)
    .map(normalizeSequenceRunState)
    .filter(isSupportedSequenceRunStateTransition)
    .filter((transition) =>
      currentStates.every((currentState) =>
        isSequenceRunStateTransitionAvailable(validationMap, transition, currentState)
      )
    )
    .map((transition) => ({
      value: transition,
      label: formatSequenceRunStateLabel(transition),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function dispatchSequenceRunStateTransition<TResult>(
  state: string,
  request: SequenceRunStateTransitionRequest,
  handlers: SequenceRunStateTransitionHandlers<TResult>
): Promise<TResult> {
  const transition = normalizeSequenceRunState(state);

  if (!isSupportedSequenceRunStateTransition(transition)) {
    return Promise.reject(
      new Error(`Unsupported sequence-run state transition: ${transition || state}`)
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

function getSequenceRunStateTransitionCounts(result: unknown): {
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

/**
 * Turns a 201/207 transition summary into user-facing feedback. A 207 carries
 * per-run `failures`, so a partially applied batch must not read as a success.
 */
export function getSequenceRunStateTransitionFeedback(
  result: unknown
): SequenceRunStateTransitionFeedback {
  const { createdCount, failedCount } = getSequenceRunStateTransitionCounts(result);
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
