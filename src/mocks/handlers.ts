// MSW handlers for API mocking
import { http, HttpResponse } from 'msw';
import type {
  TimelineEvent,
  AddCustomStateFormData,
  AddCommentFormData,
} from '../components/timeline/timeline.type';
import {
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
} from '../components/timeline/timeline.type';

type TimelineEventRecord = TimelineEvent & {
  runId?: string;
  runDisplayName?: string;
};

function toTimelineEvent(record: TimelineEventRecord): TimelineEvent {
  const { runId: _runId, runDisplayName: _runDisplayName, ...event } = record;
  return event;
}

// In-memory storage for timeline events (in real app, this would be a database)
let timelineEvents: TimelineEventRecord[] = [];

export const handlers = [
  // Get timeline events for a specific run
  http.get('/api/timeline/:runId', ({ params }) => {
    const { runId } = params;
    const events = timelineEvents.filter((event) => event.runId === runId).map(toTimelineEvent);
    return HttpResponse.json({ events });
  }),

  // Get all timeline events
  http.get('/api/timeline', () => {
    return HttpResponse.json({ events: timelineEvents.map(toTimelineEvent) });
  }),

  // Add custom state
  http.post('/api/timeline/custom-state', async ({ request }) => {
    const body = (await request.json()) as AddCustomStateFormData & {
      runId: string;
      runDisplayName: string;
    };

    const newEvent: TimelineEventRecord = {
      eventId: `evt_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: TimelineEventTypes.STATE,
      state: body.stateName,
      timestamp: body.timestamp,
      comment: body.comment || undefined,
      sourceType: TimelineEventSourceTypes.CUSTOM,
      runId: body.runId,
      runDisplayName: body.runDisplayName,
    };

    timelineEvents.push(newEvent);

    return HttpResponse.json({ success: true, event: newEvent }, { status: 201 });
  }),

  // Add comment
  http.post('/api/timeline/comment', async ({ request }) => {
    const body = (await request.json()) as AddCommentFormData & {
      runId: string;
      runDisplayName: string;
      userName: string;
    };

    const newEvent: TimelineEventRecord = {
      eventId: `evt_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: TimelineEventTypes.COMMENT,
      timestamp: body.timestamp,
      comment: body.comment,
      createdBy: body.userName,
      sourceType: TimelineEventSourceTypes.USER,
      severity: body.severity ?? TimelineCommentSeverityEnum.INFO,
      commentType: TimelineCommentTypes.GENERAL,
      runId: body.runId,
      runDisplayName: body.runDisplayName,
    };

    timelineEvents.push(newEvent);

    return HttpResponse.json({ success: true, event: newEvent }, { status: 201 });
  }),

  // Delete timeline event (optional - for future use)
  http.delete('/api/timeline/:eventId', ({ params }) => {
    const { eventId } = params;
    const index = timelineEvents.findIndex((event) => event.eventId === eventId);

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    timelineEvents.splice(index, 1);

    return HttpResponse.json({ success: true });
  }),
];

// Helper to initialize timeline events (for testing)
export function initializeTimelineEvents(events: TimelineEvent[]) {
  timelineEvents = [...events];
}
