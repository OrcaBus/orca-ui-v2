import { describe, expect, it } from 'vitest';
import { CASE_STATUS_LABELS } from '../caseStatus.visuals';

describe('CASE_STATUS_LABELS', () => {
  it('maps the sample receipt statuses from the generated contract', () => {
    expect(CASE_STATUS_LABELS.wgts_tumour_sample_received).toBe('WGTS Tumour Sample Received');
    expect(CASE_STATUS_LABELS.wgts_germline_sample_received).toBe('WGTS Germline Sample Received');
    expect(CASE_STATUS_LABELS.cttso_sample_received).toBe('CTTSO Sample Received');
    expect(CASE_STATUS_LABELS.all_sample_received).toBe('All Sample Received');
  });

  it('does not expose the retired sample_received status', () => {
    expect(CASE_STATUS_LABELS).not.toHaveProperty('sample_received');
  });
});
