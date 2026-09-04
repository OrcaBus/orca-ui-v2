import type { CaseStateModel, CaseStatusEnum } from '../api/cases.api';
import { getCaseStateTimelineTimestamp } from './caseStateDate';
import { classifyCaseStatus, type LifecycleStage } from './caseStatusRegistry';

/**
 * Minimal shape the derivation reads off `caseStatesData` (the value exposed by
 * `CaseDetailsContext`). Modeled as `Pick` of `CaseStateModel` so it stays in
 * lock-step with the API type while remaining trivial to construct in tests.
 */
type CaseStateForLifecycle = Pick<
  CaseStateModel,
  'status' | 'eventDate' | 'eventTime' | 'createdAt' | 'isArchived'
>;

/** Wrapper matching the `{ results }` envelope of `caseStatesData`. */
interface CaseStatesForLifecycle {
  results: CaseStateForLifecycle[];
}

/**
 * The single derivation the Lifecycle_Stepper and Case_Stats_Strip both consume
 * so they can never disagree about a case's ordered status history.
 */
export interface CaseLifecycleHistory {
  /**
   * Non-archived case statuses ordered ascending (oldest first) by the same
   * timestamp resolution the Timeline uses — the shape `resolveCaseLifecyclePosition`
   * expects (most-recent last).
   */
  statusHistory: CaseStatusEnum[];
  /**
   * The earliest resolved timestamp at which each Lifecycle_Stage was reached,
   * for rendering "when did each step happen" in the Lifecycle_Stepper.
   * Absent for stages the case never passed through.
   */
  stageTimestamps: Partial<Record<LifecycleStage, string>>;
}

const EMPTY_HISTORY: CaseLifecycleHistory = { statusHistory: [], stageTimestamps: {} };

/**
 * Pure derivation of a case's ordered lifecycle history from its raw case-state
 * data. Filters out archived states, resolves each state's effective timestamp
 * with `getCaseStateTimelineTimestamp` (exactly as the Case_Stats_Strip and
 * Timeline do), sorts ascending by that timestamp, and produces:
 *
 * - `statusHistory`: the ordered `CaseStatusEnum` array (most-recent last) that
 *   `resolveCaseLifecyclePosition` consumes.
 * - `stageTimestamps`: per-Lifecycle_Stage, the earliest timestamp among the
 *   states that classify into that stage.
 *
 * This is a pure function over already-fetched data — no query, no side effects.
 */
export function deriveCaseLifecycleHistory(
  caseStatesData: CaseStatesForLifecycle | null | undefined
): CaseLifecycleHistory {
  const states = caseStatesData?.results;
  if (!states || states.length === 0) return EMPTY_HISTORY;

  const orderedStates = states
    .filter((state) => !state.isArchived)
    .map((state) => ({
      status: state.status,
      timestamp: getCaseStateTimelineTimestamp(state.eventDate, state.eventTime, state.createdAt)
        .timestamp,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // First occurrence in ascending order is the earliest timestamp per stage.
  const stageTimestamps: Partial<Record<LifecycleStage, string>> = {};
  for (const { status, timestamp } of orderedStates) {
    const classification = classifyCaseStatus(status);
    if (classification.kind === 'stage') {
      stageTimestamps[classification.stage] ??= timestamp;
    }
  }

  return {
    statusHistory: orderedStates.map((state) => state.status),
    stageTimestamps,
  };
}
