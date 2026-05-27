import { describe, expect, it } from 'vitest';
import {
  formatActorTimestamp,
  formatLabel,
  formatOptionalTimelineTimestamp,
  formatTimelineTimestamp,
  getActorInitial,
  getEventTitle,
  getSourceMeta,
  isPrimitive,
  isRecord,
  isCommentEvent,
  isStateEvent,
  sortTimelineEvents,
} from '../timeline.utils';
import {
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  type TimelineEvent,
} from '../timeline.type';

describe('timeline utils', () => {
  it('identifies state and comment events', () => {
    const stateEvent = {
      eventId: 'state-1',
      eventType: TimelineEventTypes.STATE,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.SYSTEM,
      state: 'request_received',
    } satisfies TimelineEvent;

    const commentEvent = {
      eventId: 'comment-1',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Looks good',
    } satisfies TimelineEvent;

    expect(isStateEvent(stateEvent)).toBe(true);
    expect(isCommentEvent(stateEvent)).toBe(false);
    expect(isStateEvent(commentEvent)).toBe(false);
    expect(isCommentEvent(commentEvent)).toBe(true);
  });

  it('formats labels from machine readable values', () => {
    expect(formatLabel('request_received')).toBe('Request Received');
    expect(formatLabel('library-partially_failed')).toBe('Library Partially Failed');
  });

  it('formats actor initials from email addresses', () => {
    expect(getActorInitial('user@example.com')).toBe('U');
    expect(getActorInitial('')).toBe('U');
    expect(getActorInitial()).toBe('U');
  });

  it('formats actor timestamps with the shared detail display format', () => {
    expect(formatActorTimestamp('2026-02-05T03:09:00Z')).toBe('05 Feb 2026, 14:09 (UTC+11:00)');
  });

  it('derives timeline event titles', () => {
    const titledEvent = {
      eventId: 'comment-1',
      title: 'Manual Review',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Looks good',
    } satisfies TimelineEvent;

    const stateEvent = {
      eventId: 'state-1',
      eventType: TimelineEventTypes.STATE,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.SYSTEM,
      state: 'request_received',
    } satisfies TimelineEvent;

    const samplesheetEvent = {
      eventId: 'comment-2',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Uploaded',
      commentType: TimelineCommentTypes.SAMPLESHEET,
    } satisfies TimelineEvent;

    expect(getEventTitle(titledEvent)).toBe('Manual Review');
    expect(getEventTitle(stateEvent)).toBe('Workflow State Update');
    expect(getEventTitle(samplesheetEvent)).toBe('Sample Sheet Uploaded');
  });

  it('derives source metadata for timeline badges', () => {
    const systemComment = {
      eventId: 'comment-1',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.SYSTEM,
      comment: 'Created by automation',
    } satisfies TimelineEvent;

    const userState = {
      eventId: 'state-1',
      eventType: TimelineEventTypes.STATE,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      createdBy: 'user@example.com',
      state: 'request_received',
    } satisfies TimelineEvent;

    const customState = {
      eventId: 'state-2',
      eventType: TimelineEventTypes.STATE,
      timestamp: '2026-05-26T00:00:00Z',
      sourceType: TimelineEventSourceTypes.CUSTOM,
      createdBy: 'user@example.com',
      state: 'manual_review',
    } satisfies TimelineEvent;

    expect(getSourceMeta(systemComment)).toEqual({
      label: 'System',
      isSystemComment: true,
    });
    expect(getSourceMeta(userState)).toEqual({ label: 'User: user@example.com' });
    expect(getSourceMeta(customState)).toEqual({
      label: 'user@example.com',
      isCustomState: true,
    });
  });

  it('formats timestamps with the shared detail display format', () => {
    expect(formatTimelineTimestamp('2026-02-05T03:09:00Z')).toBe('05 Feb 2026, 14:09 (UTC+11:00)');
    expect(formatTimelineTimestamp('not-a-date')).toBe('not-a-date');
    expect(formatOptionalTimelineTimestamp('')).toBeNull();
    expect(formatOptionalTimelineTimestamp(null)).toBeNull();
    expect(formatOptionalTimelineTimestamp('2026-02-05T03:09:00Z')).toBe(
      '05 Feb 2026, 14:09 (UTC+11:00)'
    );
  });

  it('sorts timeline events by timestamp', () => {
    const olderEvent = {
      eventId: 'older',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-02-05T03:09:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Older',
    } satisfies TimelineEvent;

    const newerEvent = {
      eventId: 'newer',
      eventType: TimelineEventTypes.COMMENT,
      timestamp: '2026-02-06T03:09:00Z',
      sourceType: TimelineEventSourceTypes.USER,
      comment: 'Newer',
    } satisfies TimelineEvent;

    expect(
      sortTimelineEvents([olderEvent, newerEvent], 'latest').map((event) => event.eventId)
    ).toEqual(['newer', 'older']);
    expect(
      sortTimelineEvents([newerEvent, olderEvent], 'oldest').map((event) => event.eventId)
    ).toEqual(['older', 'newer']);
  });

  it('identifies records and primitive payload values', () => {
    expect(isRecord({ data: {} })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isPrimitive('value')).toBe(true);
    expect(isPrimitive(1)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
    expect(isPrimitive(null)).toBe(true);
    expect(isPrimitive({})).toBe(false);
  });
});
