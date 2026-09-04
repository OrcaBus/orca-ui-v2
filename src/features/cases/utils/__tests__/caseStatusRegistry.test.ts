import { describe, expect, it } from 'vitest';
import type { CaseStatusEnum } from '../../api/cases.api';
import {
  CASE_STATUS_CLASSIFICATION,
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_ORDER,
  classifyCaseStatus,
  type CaseStatusClassification,
} from '../caseStatusRegistry';

const EXPECTED_CLASSIFICATION: Record<CaseStatusEnum, CaseStatusClassification> = {
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

const ALL_STATUSES = Object.keys(EXPECTED_CLASSIFICATION) as CaseStatusEnum[];

describe('CASE_STATUS_CLASSIFICATION / classifyCaseStatus', () => {
  it('classifies all 17 CaseStatusEnum values exactly as expected', () => {
    expect(ALL_STATUSES).toHaveLength(17);

    for (const status of ALL_STATUSES) {
      expect(CASE_STATUS_CLASSIFICATION[status]).toEqual(EXPECTED_CLASSIFICATION[status]);
      expect(classifyCaseStatus(status)).toEqual(EXPECTED_CLASSIFICATION[status]);
    }
  });

  it.each(ALL_STATUSES.map((status) => [status, EXPECTED_CLASSIFICATION[status]] as const))(
    'classifies %s as %o',
    (status, expected) => {
      expect(classifyCaseStatus(status)).toEqual(expected);
    }
  );

  it('classifies every value as exactly one of stage or off-stepper', () => {
    for (const status of ALL_STATUSES) {
      const classification = classifyCaseStatus(status);
      expect(['stage', 'off-stepper']).toContain(classification.kind);
    }
  });
});

describe('LIFECYCLE_STAGE_ORDER / LIFECYCLE_STAGE_LABELS', () => {
  it('matches the fixed, ordered stage sequence and label snapshot', () => {
    expect(LIFECYCLE_STAGE_ORDER).toEqual([
      'samples_received',
      'sequencing_started',
      'sequencing_completed',
      'bioinformatics_started',
      'bioinformatics_completed',
      'curation_started',
      'curation_completed',
      'completed',
    ]);

    expect(LIFECYCLE_STAGE_LABELS).toEqual({
      samples_received: 'Samples Received',
      sequencing_started: 'Sequencing Started',
      sequencing_completed: 'Sequencing Completed',
      bioinformatics_started: 'Bioinformatics Started',
      bioinformatics_completed: 'Bioinformatics Completed',
      curation_started: 'Curation Started',
      curation_completed: 'Curation Completed',
      completed: 'Completed',
    });
  });

  it('includes no off-stepper value in the stage order', () => {
    const offStepperStatuses = ALL_STATUSES.filter(
      (status) => EXPECTED_CLASSIFICATION[status].kind === 'off-stepper'
    );
    for (const status of offStepperStatuses) {
      expect(LIFECYCLE_STAGE_ORDER).not.toContain(status);
    }
  });
});
