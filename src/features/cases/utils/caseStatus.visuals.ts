import type { CaseStatusEnum } from '../api/cases.api';

/**
 * Human-readable label per case lifecycle status. Color/icon/tooltip for
 * these same statuses live in the shared StatusBadge's statusConfig
 * (src/components/ui/StatusBadge.tsx, hyphenated form — e.g.
 * 'request_received' here is 'request-received' there). Render a case's
 * status directly via `<StatusBadge status={rawStatus} />`; this registry
 * exists only so screens that need to *enumerate* every possible case
 * status (e.g. the "set custom state" picker) have one exhaustively-typed
 * source for the label text. Keep the two in sync when a new case status
 * is added to the backend contract.
 */
export const CASE_STATUS_LABELS: Record<CaseStatusEnum, string> = {
  request_received: 'Request Received',
  wgts_tumour_sample_received: 'WGTS Tumour Sample Received',
  wgts_germline_sample_received: 'WGTS Germline Sample Received',
  cttso_sample_received: 'CTTSO Sample Received',
  all_sample_received: 'All Sample Received',
  library_partially_failed: 'Library Partially Failed',
  sequencing_started: 'Sequencing Started',
  sequencing_completed: 'Sequencing Completed',
  bioinformatics_started: 'Bioinformatics Started',
  bioinformatics_completed: 'Bioinformatics Completed',
  curation_started: 'Curation Started',
  curation_completed: 'Curation Completed',
  locked: 'Locked',
  unlocked: 'Unlocked',
  failed: 'Failed',
  completed: 'Completed',
  archived: 'Archived',
};
