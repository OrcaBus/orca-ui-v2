// MSW handlers for API mocking
import { http, HttpResponse } from 'msw';
import type {
  TimelineEvent,
  AddCustomStateFormData,
  AddCommentFormData,
} from '../components/timeline/timeline.type';

// In-memory storage for timeline events (in real app, this would be a database)
let timelineEvents: TimelineEvent[] = [];

export const handlers = [
  // Get timeline events for a specific run
  http.get('/api/timeline/:runId', ({ params }) => {
    const { runId } = params;
    const events = timelineEvents.filter((event) => event.runId === runId);
    return HttpResponse.json({ events });
  }),

  // Get all timeline events
  http.get('/api/timeline', () => {
    return HttpResponse.json({ events: timelineEvents });
  }),

  // Add custom state
  http.post('/api/timeline/custom-state', async ({ request }) => {
    const body = (await request.json()) as AddCustomStateFormData & {
      runId: string;
      runDisplayName: string;
    };

    const newEvent: TimelineEvent = {
      id: `evt_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'custom_state',
      stateName: body.stateName,
      timestamp: body.timestamp,
      comment: body.comment || undefined,
      source: { type: 'custom' },
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

    const newEvent: TimelineEvent = {
      id: `evt_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'comment',
      timestamp: body.timestamp,
      comment: body.comment,
      source: { type: 'user', userName: body.userName },
      runId: body.runId,
      runDisplayName: body.runDisplayName,
    };

    timelineEvents.push(newEvent);

    return HttpResponse.json({ success: true, event: newEvent }, { status: 201 });
  }),

  // Delete timeline event (optional - for future use)
  http.delete('/api/timeline/:eventId', ({ params }) => {
    const { eventId } = params;
    const index = timelineEvents.findIndex((event) => event.id === eventId);

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
