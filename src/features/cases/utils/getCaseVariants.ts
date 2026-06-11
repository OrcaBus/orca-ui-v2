import type { PillTagVariant } from '@/components/ui/PillTag';
import type { CaseTypeEnum, CaseStudyTypeEnum } from '../api/cases.api';

export function getCaseTypeVariant(type: CaseTypeEnum): PillTagVariant {
  switch (type) {
    case 'wgts':
      return 'purple';
    case 'cttso':
      return 'green';
    case 'wgs_n':
      return 'amber';
    default:
      return 'blue';
  }
}

export function getCaseStudyTypeVariant(type: CaseStudyTypeEnum): PillTagVariant {
  switch (type) {
    case 'clinical':
      return 'blue';
    case 'research':
      return 'purple';
    default:
      return 'neutral';
  }
}
