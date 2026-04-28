import type { StatusEvent } from '../../../data/mockData';
import {
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  type TimelineEvent,
} from '../../../components/timeline/timeline.type';

/**
 * Maps legacy StatusEvent (sequence run statusHistory) to the enhanced TimelineEvent shape.
 */
export function statusEventToTimelineEvent(
  event: StatusEvent,
  runId: string,
  index: number
): TimelineEvent {
  const sourceType =
    event.type === 'comment'
      ? TimelineEventSourceTypes.USER
      : event.type === 'manual'
        ? TimelineEventSourceTypes.CUSTOM
        : TimelineEventSourceTypes.SYSTEM;

  if (event.type === 'comment') {
    return {
      eventId: `seq-${runId}-${index}-${event.timestamp}`,
      eventType: TimelineEventTypes.COMMENT,
      timestamp: event.timestamp,
      comment: event.message ?? '',
      createdBy: event.user,
      sourceType,
      severity: TimelineCommentSeverityEnum.INFO,
      commentType: TimelineCommentTypes.GENERAL,
    };
  }

  return {
    eventId: `seq-${runId}-${index}-${event.timestamp}`,
    eventType: TimelineEventTypes.STATE,
    state: event.status,
    timestamp: event.timestamp,
    comment: event.message,
    createdBy: event.user,
    sourceType,
  };
}

/**
 * Converts an array of StatusEvents (e.g. from SequenceRun.statusHistory) into TimelineEvent[].
 */
export function statusEventsToTimelineEvents(
  events: StatusEvent[],
  runId: string
): TimelineEvent[] {
  return events.map((e, i) => statusEventToTimelineEvent(e, runId, i));
}
