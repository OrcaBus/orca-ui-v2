import { describe, expect, it } from 'vitest';
import { PARAM_PAGE, PARAM_ROWS_PER_PAGE } from '@/utils/constants';
import { getEffectivePaginationKeys, getPaginationKeysCacheKey } from '../useQueryParams';

describe('useQueryParams pagination key normalization', () => {
  it('returns the same default pagination keys reference when options omit pagination keys', () => {
    expect(getEffectivePaginationKeys()).toBe(getEffectivePaginationKeys());
    expect(getEffectivePaginationKeys()).toEqual([PARAM_PAGE, PARAM_ROWS_PER_PAGE]);
  });

  it('returns the same cached reference for equivalent custom pagination key arrays', () => {
    expect(getEffectivePaginationKeys([])).toBe(getEffectivePaginationKeys([]));
    expect(getEffectivePaginationKeys(['page'])).toBe(getEffectivePaginationKeys(['page']));
  });

  it('uses a content-based cache key for pagination key arrays', () => {
    expect(getPaginationKeysCacheKey(['page', 'rowsPerPage'])).toBe(
      getPaginationKeysCacheKey(['page', 'rowsPerPage'])
    );
    expect(getPaginationKeysCacheKey([])).toBe('');
  });
});
