import { describe, expect, it, vi } from 'vitest';
import {
  formatBackendDate,
  formatDetailDate,
  formatTableDate,
  getRelativeTime,
} from '../timeFormat';

describe('formatTableDate', () => {
  it('formats valid ISO dates in UI table format', () => {
    expect(formatTableDate('2026-02-05T03:09:00Z')).toBe('2026-02-05 14:09 +11:00');
  });

  it('returns original string for invalid dates', () => {
    expect(formatTableDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDetailDate', () => {
  it('formats valid ISO dates in human-friendly detail format', () => {
    expect(formatDetailDate('2026-02-05T03:09:00Z')).toBe('05 Feb 2026, 14:09 (UTC+11:00)');
  });
});

describe('formatBackendDate', () => {
  it('returns UTC ISO 8601 output', () => {
    const date = new Date('2026-02-05T03:09:00Z');
    expect(formatBackendDate(date)).toBe('2026-02-05T03:09:00.000Z');
  });
});

describe('getRelativeTime', () => {
  it('returns "just now" for sub-minute differences', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-05T03:09:30Z'));
    expect(getRelativeTime('2026-02-05T03:09:00Z')).toBe('just now');
    vi.useRealTimers();
  });

  it('returns minute/hour/day relative labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T03:09:00Z'));

    expect(getRelativeTime('2026-02-06T03:00:00Z')).toBe('9m ago');
    expect(getRelativeTime('2026-02-06T00:09:00Z')).toBe('3h ago');
    expect(getRelativeTime('2026-02-04T03:09:00Z')).toBe('2d ago');

    vi.useRealTimers();
  });

  it('falls back to detail format after 7 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T03:09:00Z'));
    expect(getRelativeTime('2026-02-05T03:09:00Z')).toBe('05 Feb 2026, 14:09 (UTC+11:00)');
    vi.useRealTimers();
  });

  it('returns original string for invalid dates', () => {
    expect(getRelativeTime('not-a-date')).toBe('not-a-date');
  });
});
