// Timeline types for Sequence Run and Workflow Run detail pages

export type TimelineEventType =
  | 'status_updated'
  | 'comment'
  | 'samplesheet_added'
  | 'samplesheet_validated'
  | 'workflow_started'
  | 'workflow_completed'
  | 'lane_completed'
  | 'qc_passed'
  | 'qc_failed'
  | 'file_uploaded'
  | 'metadata_updated'
  | 'custom_state';

export type TimelineEventSource =
  | { type: 'system' }
  | { type: 'user'; userName: string }
  | { type: 'custom' };

export type WorkflowRunStatus =
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing'
  | 'queued'
  | 'initializing';

export type SequenceRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;

  // State information (optional - only for state-based events)
  stateName?: string;

  // Timestamp
  timestamp: string;

  // Optional comment/note
  comment?: string;

  // Event source
  source: TimelineEventSource;

  // Optional payload (JSON data associated with the event)
  payload?: Record<string, unknown>;

  // Associated run ID (for filtering)
  runId?: string;

  // Display name for the run (e.g., "WFR.abc123xyz")
  runDisplayName?: string;
}

export interface TimelineFilters {
  runId: string; // "all" or specific run ID
  sortOrder: 'latest' | 'oldest';
}

export interface AddCustomStateFormData {
  stateName: string;
  timestamp: string;
  comment: string;
}

export interface AddCommentFormData {
  timestamp: string;
  comment: string;
}

// Timeline event display configuration
export interface TimelineEventConfig {
  label: string; // Display label for the event type
  icon: 'success' | 'failure' | 'neutral' | 'comment' | 'upload' | 'processing';
}
