import { describe, expect, it } from 'vitest';
import { getValidationStatusDisplay } from '../validationResponse';

describe('sschecker validation response helpers', () => {
  it('maps PASS responses to passed display state', () => {
    expect(getValidationStatusDisplay('PASS')).toEqual({
      label: 'PASS',
      status: 'passed',
    });
  });

  it('treats non-PASS statuses as failed while preserving backend text', () => {
    expect(getValidationStatusDisplay('FAIL')).toEqual({
      label: 'FAIL',
      status: 'failed',
    });

    expect(getValidationStatusDisplay('SCHEMA_WARNING')).toEqual({
      label: 'SCHEMA_WARNING',
      status: 'failed',
    });
  });

  it('uses UNKNOWN for missing backend status text', () => {
    expect(getValidationStatusDisplay(undefined)).toEqual({
      label: 'UNKNOWN',
      status: 'failed',
    });
  });
});
