import { describe, expect, it } from 'vitest';
import { getCaseStateTimelineTimestamp } from '../caseStateDate';

describe('getCaseStateTimelineTimestamp', () => {
  it('anchors an event date and time to the display timezone', () => {
    expect(getCaseStateTimelineTimestamp('2026-08-03', '09:30:00', '2026-08-04T00:00:00Z')).toEqual(
      { timestamp: '2026-08-02T23:30:00.000Z' }
    );
  });

  it('marks an event without time as date-only', () => {
    expect(getCaseStateTimelineTimestamp('2026-08-03', null, '2026-08-04T00:00:00Z')).toEqual({
      timestamp: '2026-08-03',
      timestampPrecision: 'date',
    });
  });

  it('falls back to createdAt for an invalid event date', () => {
    expect(getCaseStateTimelineTimestamp('invalid', null, '2026-08-04T00:00:00Z')).toEqual({
      timestamp: '2026-08-04T00:00:00Z',
    });
  });

  it('keeps a valid event date when its optional time is malformed', () => {
    expect(getCaseStateTimelineTimestamp('2026-08-03', 'invalid', '2026-08-04T00:00:00Z')).toEqual({
      timestamp: '2026-08-03',
      timestampPrecision: 'date',
    });
  });
});
