import type { PillTagVariant } from '@/components/ui/PillTag';
import type { CaseStatusEnum } from '../api/cases.api';

export type CaseStatusVisual = {
  variant: PillTagVariant;
  label: string;
};

export const CASE_STATUS_VISUALS: Record<CaseStatusEnum, CaseStatusVisual> = {
  request_received: { variant: 'blue', label: 'Request Received' },
  sample_received: { variant: 'blue', label: 'Sample Received' },
  library_partially_failed: { variant: 'amber', label: 'Library Partially Failed' },
  sequencing_started: { variant: 'blue', label: 'Sequencing Started' },
  sequencing_completed: { variant: 'purple', label: 'Sequencing Completed' },
  bioinformatics_started: { variant: 'blue', label: 'Bioinformatics Started' },
  bioinformatics_completed: { variant: 'purple', label: 'Bioinformatics Completed' },
  curation_started: { variant: 'blue', label: 'Curation Started' },
  curation_completed: { variant: 'purple', label: 'Curation Completed' },
  locked: { variant: 'neutral', label: 'Locked' },
  unlocked: { variant: 'neutral', label: 'Unlocked' },
  failed: { variant: 'red', label: 'Failed' },
  completed: { variant: 'green', label: 'Completed' },
  archived: { variant: 'neutral', label: 'Archived' },
};

const FALLBACK_VISUAL: CaseStatusVisual = { variant: 'neutral', label: 'Unknown' };

export function getCaseStatusVisual(status: string): CaseStatusVisual {
  return CASE_STATUS_VISUALS[status as CaseStatusEnum] ?? FALLBACK_VISUAL;
}
