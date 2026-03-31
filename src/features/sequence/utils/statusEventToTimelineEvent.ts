import type { StatusEvent } from '../../../data/mockData';
import type {
  TimelineEvent,
  TimelineEventSource,
} from '../../../components/timeline/timeline.type';

/**
 * Maps legacy StatusEvent (sequence run statusHistory) to the enhanced TimelineEvent shape.
 */
export function statusEventToTimelineEvent(
  event: StatusEvent,
  runId: string,
  runDisplayName: string,
  index: number
): TimelineEvent {
  const eventType =
    event.type === 'comment'
      ? 'comment'
      : event.type === 'manual'
        ? 'custom_state'
        : 'status_updated';

  const source: TimelineEventSource =
    event.type === 'comment'
      ? { type: 'user', userName: event.user ?? 'Unknown' }
      : event.type === 'manual'
        ? { type: 'custom' }
        : { type: 'system' };

  return {
    id: `seq-${runId}-${index}-${event.timestamp}`,
    eventType,
    stateName: event.status,
    timestamp: event.timestamp,
    comment: event.message,
    source,
    runId,
    runDisplayName,
  };
}

/**
 * Converts an array of StatusEvents (e.g. from SequenceRun.statusHistory) into TimelineEvent[].
 */
export function statusEventsToTimelineEvents(
  events: StatusEvent[],
  runId: string,
  runDisplayName: string
): TimelineEvent[] {
  return events.map((e, i) => statusEventToTimelineEvent(e, runId, runDisplayName, i));
}
