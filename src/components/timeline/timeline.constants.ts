import { TimelineEventConfig, TimelineEventType } from './timeline.type';

export const TIMELINE_EVENT_CONFIGS: Record<TimelineEventType, TimelineEventConfig> = {
  status_updated: { label: 'Status Updated', icon: 'neutral' },
  comment: { label: 'Comment Added', icon: 'comment' },
  samplesheet_added: { label: 'Sample Sheet Added', icon: 'upload' },
  samplesheet_validated: { label: 'Sample Sheet Validated', icon: 'success' },
  workflow_started: { label: 'Workflow Started', icon: 'processing' },
  workflow_completed: { label: 'Workflow Completed', icon: 'success' },
  lane_completed: { label: 'Lane Completed', icon: 'success' },
  qc_passed: { label: 'QC Passed', icon: 'success' },
  qc_failed: { label: 'QC Failed', icon: 'failure' },
  file_uploaded: { label: 'File Uploaded', icon: 'upload' },
  metadata_updated: { label: 'Metadata Updated', icon: 'neutral' },
  custom_state: { label: 'Custom State', icon: 'neutral' },
};
