import type { ValidationStatus } from '@/utils/constants';

export interface ValidationStatusDisplay {
  label: string;
  status: ValidationStatus;
}

export function getValidationStatusDisplay(
  checkStatus: string | undefined
): ValidationStatusDisplay {
  const label = checkStatus?.trim() || 'UNKNOWN';

  return {
    label,
    status: label === 'PASS' ? 'passed' : 'failed',
  };
}
