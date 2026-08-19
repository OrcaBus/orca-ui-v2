import { describe, expect, it } from 'vitest';
import {
  getStatusFamily,
  normalizeStatusBadgeKey,
  statusConfig,
  type StatusBadgeStatus,
  type StatusFamily,
} from '../status-config';

const workflowStates: Array<[StatusBadgeStatus, StatusFamily]> = [
  ['draft', 'neutral'],
  ['submitted', 'neutral'],
  ['runnable', 'neutral'],
  ['starting', 'neutral'],
  ['started', 'info'],
  ['running', 'info'],
  ['succeeded', 'success'],
  ['failed', 'error'],
  ['aborted', 'neutral'],
  ['cancelled', 'neutral'],
  ['resolved', 'info'],
  ['deprecated', 'neutral'],
];

describe('workflow status registry', () => {
  it.each(workflowStates)('maps %s to the %s family', (status, family) => {
    expect(normalizeStatusBadgeKey(status)).toBe(status);
    expect(getStatusFamily(status)).toBe(family);
    expect(statusConfig[status].label).not.toBe('Unknown');
  });

  it.each([
    ['canceled', 'cancelled'],
    ['complete', 'succeeded'],
    ['success', 'succeeded'],
    ['error', 'failed'],
    ['initializing', 'started'],
  ] as const)('normalizes alias %s to %s', (raw, canonical) => {
    expect(normalizeStatusBadgeKey(raw)).toBe(canonical);
    expect(getStatusFamily(raw)).toBe(statusConfig[canonical].family);
  });

  it.each([
    [' SUBMITTED ', 'submitted'],
    ['not_started', 'not-started'],
    ['request received', 'request-received'],
    ['request__  received', 'request-received'],
  ] as const)('normalizes formatting in %s', (raw, canonical) => {
    expect(normalizeStatusBadgeKey(raw)).toBe(canonical);
  });

  it.each([null, undefined, '', '   ', 'unkown', 'brand-new-state', 'constructor'])(
    'falls back to unknown for %s',
    (raw) => {
      expect(normalizeStatusBadgeKey(raw)).toBe('unknown');
      expect(getStatusFamily(raw)).toBe('neutral');
    }
  );
});
