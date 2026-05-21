import { describe, expect, it } from 'vitest';
import { compareStringArrays } from '../array';

describe('compareStringArrays', () => {
  it('marks arrays equal when they have the same strings in the same order', () => {
    expect(compareStringArrays(['name', 'status'], ['name', 'status'])).toEqual({
      isEqual: true,
      added: [],
      removed: [],
      shared: ['name', 'status'],
    });
  });

  it('reports added, removed, and shared values', () => {
    expect(compareStringArrays(['name', 'actions', 'old'], ['name', 'status', 'actions'])).toEqual({
      isEqual: false,
      added: ['status'],
      removed: ['old'],
      shared: ['name', 'actions'],
    });
  });

  it('treats a different order as not equal while preserving shared next-array order', () => {
    expect(compareStringArrays(['actions', 'name'], ['name', 'actions'])).toEqual({
      isEqual: false,
      added: [],
      removed: [],
      shared: ['name', 'actions'],
    });
  });
});
