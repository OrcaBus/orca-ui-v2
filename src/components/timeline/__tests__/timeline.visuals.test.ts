import { describe, expect, it } from 'vitest';
import { getTimelineEventVisual, getTimelineStateVisual } from '../timeline.visuals';
import {
  TimelineCommentSeverityEnum,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  type TimelineEvent,
} from '../timeline.type';

describe('getTimelineStateVisual', () => {
  it.each([
    ['SUBMITTED', 'neutral-100'],
    ['RUNNABLE', 'neutral-100'],
    ['STARTING', 'neutral-100'],
    ['STARTED', 'blue'],
    ['CANCELLED', 'neutral-100'],
    ['CANCELED', 'neutral-100'],
  ])('uses the registry family for workflow state %s', (status, expectedClassPart) => {
    expect(getTimelineStateVisual(status).badgeClassName).toContain(expectedClassPart);
  });

  it.each([
    ['request_received', 'blue'],
    ['sequencing_started', 'blue'],
    ['library_partially_failed', 'amber'],
    ['completed', 'green'],
    ['failed', 'red'],
    // 'archived' aliases to DEPRECATED, which shares the one canonical
    // neutral-family treatment now (neutral-100) — it used to carry its
    // own slightly-different neutral-200 shade for no documented reason.
    ['archived', 'neutral-100'],
  ])('maps case status %s to %s timeline styling', (status, expectedClassPart) => {
    expect(getTimelineStateVisual(status).badgeClassName).toContain(expectedClassPart);
  });
});

describe('getTimelineEventVisual', () => {
  it('uses archived styling for archived state records', () => {
    const event = {
      eventId: 'state-1',
      eventType: TimelineEventTypes.STATE,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      state: 'failed',
      isArchived: true,
    } satisfies TimelineEvent;

    expect(getTimelineEventVisual(event).badgeClassName).toContain('neutral-200');
  });

  it('uses archived styling for archived comment records', () => {
    const event = {
      eventId: 'comment-1',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Archived comment',
      severity: TimelineCommentSeverityEnum.ERROR,
      isArchived: true,
    } satisfies TimelineEvent;

    expect(getTimelineEventVisual(event).badgeClassName).toContain('neutral-200');
  });
});
