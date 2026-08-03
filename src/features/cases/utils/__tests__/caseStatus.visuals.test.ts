import { describe, expect, it } from 'vitest';
import { CASE_STATUS_VISUALS } from '../caseStatus.visuals';

describe('CASE_STATUS_VISUALS', () => {
  it('maps the sample receipt statuses from the generated contract', () => {
    expect(CASE_STATUS_VISUALS.wgts_tumour_sample_received.label).toBe(
      'WGTS Tumour Sample Received'
    );
    expect(CASE_STATUS_VISUALS.wgts_germline_sample_received.label).toBe(
      'WGTS Germline Sample Received'
    );
    expect(CASE_STATUS_VISUALS.cttso_sample_received.label).toBe('CTTSO Sample Received');
    expect(CASE_STATUS_VISUALS.all_sample_received.label).toBe('All Sample Received');
  });

  it('does not expose the retired sample_received status', () => {
    expect(CASE_STATUS_VISUALS).not.toHaveProperty('sample_received');
  });
});
