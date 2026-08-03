import type { ReactNode } from 'react';

// Timeline types for Sequence Run and Workflow Run details pages

export enum TimelineEventTypes {
  STATE = 'state',
  COMMENT = 'comment',
}

export const TimelineStateEventTypes = {
  STATE: TimelineEventTypes.STATE,
} as const;
export type TimelineStateEventTypes =
  (typeof TimelineStateEventTypes)[keyof typeof TimelineStateEventTypes];

export const TimelineCommentEventTypes = {
  COMMENT: TimelineEventTypes.COMMENT,
} as const;
export type TimelineCommentEventTypes =
  (typeof TimelineCommentEventTypes)[keyof typeof TimelineCommentEventTypes];

export enum TimelineEventSourceTypes {
  SYSTEM = 'system',
  USER = 'user',
  CUSTOM = 'custom',
}

export const TimelineSourceTypes = TimelineEventSourceTypes;
export type TimelineSourceTypes = TimelineEventSourceTypes;

export const TimelineCommentSeverityEnum = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;
export type TimelineCommentSeverityEnum =
  (typeof TimelineCommentSeverityEnum)[keyof typeof TimelineCommentSeverityEnum];

export const CommentSeverityEnum = TimelineCommentSeverityEnum;
export type CommentSeverityEnum = TimelineCommentSeverityEnum;

export const TimelineCommentTypes = {
  GENERAL: 'comment',
  SAMPLESHEET: 'samplesheet',
} as const;
export type TimelineCommentTypes = (typeof TimelineCommentTypes)[keyof typeof TimelineCommentTypes];

export type TimelineEventType = TimelineEventTypes;

export type WorkflowRunStatus =
  | 'DRAFT'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'ABORTED'
  | 'RESOLVED'
  | 'DEPRECATED'
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing'
  | 'queued'
  | 'initializing';

export type SequenceRunStatus =
  | 'DEPRECATED'
  | 'FAILED'
  | 'STARTED'
  | 'SUCCEEDED'
  | 'ABORTED'
  | 'RESOLVED'
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface TimelineEventAction {
  /** Stable identifier used as React key and internal pending state. */
  id: string;
  label: string;
  onClick: (event: TimelineEvent) => void | Promise<void>;
  disabled?: boolean | ((event: TimelineEvent) => boolean);
  icon?: ReactNode;
}

export type TimelineTimestampPrecision = 'date' | 'date-time';

interface TimelineBaseEvent {
  eventId: string;
  title?: string;
  timestamp: string;
  timestampPrecision?: TimelineTimestampPrecision;
  createdBy?: string;
  isArchived?: boolean;
  archivedAt?: string | null;
  archivedBy?: string | null;
  sourceType: TimelineEventSourceTypes;
  actions?: TimelineEventAction[];

  // Optional payload metadata for dialog-driven payload viewers.
  payloadId?: string;
  payload?: Record<string, unknown>;
}

export interface TimelineStateEvent extends TimelineBaseEvent {
  eventType: TimelineStateEventTypes;
  state: string;
  comment?: string;
}

export interface TimelineCommentEvent extends TimelineBaseEvent {
  eventType: TimelineCommentEventTypes;
  comment: string;
  severity?: CommentSeverityEnum;
  commentType?: TimelineCommentTypes;
}

/** @deprecated Prefer TimelineCommentEvent. */
export type TimelinecommentEvent = TimelineCommentEvent;

export type TimelineEvent = TimelineStateEvent | TimelineCommentEvent;

export interface CustomStateFormData {
  stateName: string;
  timestamp: string;
  comment: string;
}

export type AddCustomStateFormData = CustomStateFormData;

export interface CommentFormData {
  timestamp: string;
  comment: string;
  severity: CommentSeverityEnum;
}

export type AddCommentFormData = CommentFormData;

// Timeline event display configuration
export interface TimelineEventConfig {
  label: string; // Display label for the event type
  icon: 'state' | 'comment';
}
