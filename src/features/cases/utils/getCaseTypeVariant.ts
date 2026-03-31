import type { CaseTypeVariant } from '../types/case.types';

export function getCaseTypeVariant(type: string): CaseTypeVariant {
  switch (type) {
    case 'clinical':
      return 'blue';
    case 'research':
      return 'purple';
    case 'validation':
      return 'green';
    case 'qc':
      return 'amber';
    default:
      return 'blue';
  }
}
