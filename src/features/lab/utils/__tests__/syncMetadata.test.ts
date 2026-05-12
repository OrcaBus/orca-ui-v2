import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GSHEET_PREVIEW_RANGE,
  resolveGsheetPreviewRanges,
  sanitizeGsheetRanges,
} from '../syncMetadata';

describe('syncMetadata helpers', () => {
  it('uses the first ten rows as the default Google Sheet preview range', () => {
    expect(DEFAULT_GSHEET_PREVIEW_RANGE).toBe('0:10');
    expect(resolveGsheetPreviewRanges('')).toEqual(['0:10']);
  });

  it('sanitizes single row ranges to explicit start and end values', () => {
    expect(sanitizeGsheetRanges('20:30, 40, 50:60')).toEqual(['20:30', '40:40', '50:60']);
  });
});
