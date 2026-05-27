import { formatDetailDate } from '@/utils/timeFormat';
import type { TimelineCommentEvent, TimelineEvent, TimelineStateEvent } from './timeline.type';
import {
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
} from './timeline.type';

export type TimelineSourceMeta = {
  label?: string;
  isCustomState?: boolean;
  isSystemComment?: boolean;
};

export type TimelineSortOrder = 'latest' | 'oldest';

/** Narrows a timeline event to the state-event variant. */
export function isStateEvent(event: TimelineEvent): event is TimelineStateEvent {
  return event.eventType === TimelineEventTypes.STATE;
}

/** Narrows a timeline event to the comment-event variant. */
export function isCommentEvent(event: TimelineEvent): event is TimelineCommentEvent {
  return event.eventType === TimelineEventTypes.COMMENT;
}

/** Converts timeline status and severity values into display labels. */
export function formatLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Returns the first display initial for a timeline actor. */
export function getActorInitial(actorEmail?: string): string {
  return actorEmail?.trim().charAt(0).toUpperCase() || 'U';
}

/** Formats the timestamp shown beside an actor in timeline dialogs. */
export function formatActorTimestamp(actorTimestamp?: string): string {
  return formatTimelineTimestamp(actorTimestamp || new Date().toISOString());
}

/** Resolves the display title for a timeline event. */
export function getEventTitle(event: TimelineEvent): string {
  if (event.title) {
    return String(event.title);
  }

  if (isStateEvent(event)) {
    return 'Workflow State Update';
  }

  if (event.commentType === TimelineCommentTypes.SAMPLESHEET) {
    return 'Sample Sheet Uploaded';
  }

  return 'Comment Added';
}

/** Builds the source label and badge flags shown in a timeline event header. */
export function getSourceMeta(event: TimelineEvent): TimelineSourceMeta {
  if (isCommentEvent(event) && event.sourceType === TimelineEventSourceTypes.SYSTEM) {
    return {
      label: event.createdBy ? event.createdBy : 'System',
      isSystemComment: true,
    };
  }

  if (event.sourceType === TimelineEventSourceTypes.SYSTEM) {
    return {};
  }

  if (event.sourceType === TimelineEventSourceTypes.USER) {
    if (!event.createdBy) {
      return { label: 'User' };
    }

    return {
      label: isCommentEvent(event) ? event.createdBy : `User: ${event.createdBy}`,
    };
  }

  return {
    label: event.createdBy,
    isCustomState: isStateEvent(event),
  };
}

/** Formats an ISO-like timestamp with the system detail-display format. */
export function formatTimelineTimestamp(timestamp: string): string {
  return formatDetailDate(timestamp);
}

/** Safely formats optional timestamps from API data after runtime validation. */
export function formatOptionalTimelineTimestamp(timestamp: unknown): string | null {
  if (typeof timestamp !== 'string' || timestamp.length === 0) {
    return null;
  }

  return formatTimelineTimestamp(timestamp);
}

/** Sorts timeline events without mutating the caller-provided event array. */
export function sortTimelineEvents(
  events: TimelineEvent[],
  sortOrder: TimelineSortOrder
): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const dateA = Date.parse(a.timestamp);
    const dateB = Date.parse(b.timestamp);

    if (Number.isNaN(dateA) || Number.isNaN(dateB) || dateA === dateB) {
      return 0;
    }

    return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
  });
}

/** Identifies plain object payload values that can be rendered as key-value rows. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Identifies scalar payload values that can be rendered directly in lists. */
export function isPrimitive(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}
