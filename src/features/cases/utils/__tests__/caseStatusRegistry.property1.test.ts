import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { classifyCaseStatus } from '../caseStatusRegistry';
import type { CaseStatusEnum } from '../../api/cases.api';

/**
 * The 17 literal values of `CaseStatusEnum` (`case.openapi.d.ts`'s `StatusEnum`).
 * Duplicated here deliberately: the property must range over the *exact* enum
 * literal space, not over `classifyCaseStatus`'s implementation details.
 */
const CASE_STATUS_ENUM_VALUES: CaseStatusEnum[] = [
  'request_received',
  'wgts_tumour_sample_received',
  'wgts_germline_sample_received',
  'cttso_sample_received',
  'all_sample_received',
  'library_partially_failed',
  'sequencing_started',
  'sequencing_completed',
  'bioinformatics_started',
  'bioinformatics_completed',
  'curation_started',
  'curation_completed',
  'locked',
  'unlocked',
  'failed',
  'completed',
  'archived',
];

describe('caseStatusRegistry — Property 1: Classification totality', () => {
  it('classifies every CaseStatusEnum value as defined and exactly one of stage/off-stepper', () => {
    fc.assert(
      fc.property(fc.constantFrom(...CASE_STATUS_ENUM_VALUES), (status) => {
        const classification = classifyCaseStatus(status);

        expect(classification).toBeDefined();
        expect(['stage', 'off-stepper']).toContain(classification.kind);

        if (classification.kind === 'stage') {
          expect(classification).not.toHaveProperty('kind', 'off-stepper');
        } else {
          expect(classification.kind).toBe('off-stepper');
        }
      })
    );
  });
});
