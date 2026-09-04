import type { CaseStatusEnum } from '../api/cases.api';
import { getStatusFamily, type StatusFamily } from '@/components/ui/status-config';

/**
 * Case_Status_Registry — the single source of truth for classifying every
 * `CaseStatusEnum` value into a Lifecycle_Stage or an Off_Stepper_Status,
 * and for deriving a stage's ordered position, display label, and status
 * family. `CaseHeader`, `LifecycleStepper`, and `CaseStatsStrip` all read
 * lifecycle position from this module (via `resolveCaseLifecyclePosition`)
 * so they can never disagree for the same case. See design.md's
 * "Case_Status_Registry — architecture role" section.
 */

export type LifecycleStage =
  | 'samples_received'
  | 'sequencing_started'
  | 'sequencing_completed'
  | 'bioinformatics_started'
  | 'bioinformatics_completed'
  | 'curation_started'
  | 'curation_completed'
  | 'completed';

/** Fixed, ordered sequence the Lifecycle_Stepper renders. Index = stage position. */
export const LIFECYCLE_STAGE_ORDER: readonly LifecycleStage[] = [
  'samples_received',
  'sequencing_started',
  'sequencing_completed',
  'bioinformatics_started',
  'bioinformatics_completed',
  'curation_started',
  'curation_completed',
  'completed',
];

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  samples_received: 'Samples Received',
  sequencing_started: 'Sequencing Started',
  sequencing_completed: 'Sequencing Completed',
  bioinformatics_started: 'Bioinformatics Started',
  bioinformatics_completed: 'Bioinformatics Completed',
  curation_started: 'Curation Started',
  curation_completed: 'Curation Completed',
  completed: 'Completed',
};

/**
 * One representative CaseStatusEnum value per stage, used only to borrow
 * that status's family from status-config.ts — never rendered directly.
 */
const STAGE_FAMILY_REPRESENTATIVE: Record<LifecycleStage, CaseStatusEnum> = {
  samples_received: 'all_sample_received',
  sequencing_started: 'sequencing_started',
  sequencing_completed: 'sequencing_completed',
  bioinformatics_started: 'bioinformatics_started',
  bioinformatics_completed: 'bioinformatics_completed',
  curation_started: 'curation_started',
  curation_completed: 'curation_completed',
  completed: 'completed',
};

export type CaseStatusClassification =
  { kind: 'stage'; stage: LifecycleStage } | { kind: 'off-stepper' };

export const CASE_STATUS_CLASSIFICATION: Record<CaseStatusEnum, CaseStatusClassification> = {
  request_received: { kind: 'off-stepper' },
  wgts_tumour_sample_received: { kind: 'stage', stage: 'samples_received' },
  wgts_germline_sample_received: { kind: 'stage', stage: 'samples_received' },
  cttso_sample_received: { kind: 'stage', stage: 'samples_received' },
  all_sample_received: { kind: 'stage', stage: 'samples_received' },
  sequencing_started: { kind: 'stage', stage: 'sequencing_started' },
  sequencing_completed: { kind: 'stage', stage: 'sequencing_completed' },
  bioinformatics_started: { kind: 'stage', stage: 'bioinformatics_started' },
  bioinformatics_completed: { kind: 'stage', stage: 'bioinformatics_completed' },
  curation_started: { kind: 'stage', stage: 'curation_started' },
  curation_completed: { kind: 'stage', stage: 'curation_completed' },
  completed: { kind: 'stage', stage: 'completed' },
  library_partially_failed: { kind: 'off-stepper' },
  failed: { kind: 'off-stepper' },
  locked: { kind: 'off-stepper' },
  unlocked: { kind: 'off-stepper' },
  archived: { kind: 'off-stepper' },
};

export function classifyCaseStatus(status: CaseStatusEnum): CaseStatusClassification {
  return CASE_STATUS_CLASSIFICATION[status];
}

export function getLifecycleStagePosition(stage: LifecycleStage): number {
  return LIFECYCLE_STAGE_ORDER.indexOf(stage);
}

export function getLifecycleStageFamily(stage: LifecycleStage): StatusFamily {
  return getStatusFamily(STAGE_FAMILY_REPRESENTATIVE[stage]);
}

/**
 * Resolves a case's current lifecycle position from its ordered case-state
 * history (most-recent last), for the Lifecycle_Stepper and
 * Case_Stats_Strip.
 *
 * - If the latest status is a Lifecycle_Stage member, `currentPosition` is
 *   that stage's index and `isOffStepper` is false.
 * - If the latest status is an Off_Stepper_Status, `currentPosition` is the
 *   highest stage position found by scanning history backwards for the most
 *   recent stage-classified status (or null if none exists), and
 *   `isOffStepper` is true.
 * - If there is no latest status, `currentPosition` is null.
 */
export function resolveCaseLifecyclePosition(statusHistory: readonly CaseStatusEnum[]): {
  currentPosition: number | null;
  isOffStepper: boolean;
  /**
   * Highest stage index ever reached in the history, regardless of later
   * re-entrant statuses (e.g. a second `sequencing_started` after
   * `sequencing_completed`). Use this to decide which steps render
   * 'complete' so the stepper never visually regresses.
   */
  maxPosition: number | null;
  /**
   * True when the latest status is a stage index lower than `maxPosition`
   * — i.e. a stage was re-entered after a later stage had already been
   * reached (e.g. re-sequencing). The stepper should keep showing
   * `maxPosition` as complete and flag this rather than moving backwards.
   */
  isReworking: boolean;
} {
  if (statusHistory.length === 0) {
    return { currentPosition: null, isOffStepper: false, maxPosition: null, isReworking: false };
  }

  // Walk the history oldest -> newest, updating two running values:
  // - maxPosition: the furthest stage reached so far
  // - lastStagePosition: the most recent stage seen so far (may sit
  //   behind maxPosition if an earlier stage was re-entered)
  let maxPosition: number | null = null;
  let lastStagePosition: number | null = null;
  let latestIsStage = false;

  for (let i = 0; i < statusHistory.length; i++) {
    const classification = classifyCaseStatus(statusHistory[i]);

    if (classification.kind !== 'stage') continue;

    const position = getLifecycleStagePosition(classification.stage);
    lastStagePosition = position;
    if (maxPosition === null || position > maxPosition) {
      maxPosition = position;
    }
    if (i === statusHistory.length - 1) {
      latestIsStage = true;
    }
  }

  if (latestIsStage) {
    // lastStagePosition is the latest status's own position here.
    const currentPosition = lastStagePosition as number;
    return {
      currentPosition,
      isOffStepper: false,
      maxPosition,
      isReworking: maxPosition !== null && currentPosition < maxPosition,
    };
  }

  // Latest status is off-stepper (failed/locked/etc): fall back to the
  // most recent stage seen before it, if any.
  return {
    currentPosition: lastStagePosition,
    isOffStepper: true,
    maxPosition,
    isReworking: false,
  };
}

/**
 * Percent complete for Case_Stats_Strip; null when no numeric position
 * exists (Off_Stepper_Status with no prior stage, or no latest state).
 */
export function getLifecyclePercentComplete(currentPosition: number | null): number | null {
  if (currentPosition === null) return null;
  return Math.round((currentPosition / (LIFECYCLE_STAGE_ORDER.length - 1)) * 100);
}
