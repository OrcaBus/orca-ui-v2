import { describe, expect, it } from 'vitest';
import { formatLogLines, getLogSeverity } from '../logFormatting';

describe('sschecker log formatting helpers', () => {
  it('returns an empty array for an empty backend log', () => {
    expect(formatLogLines('')).toEqual([]);
    expect(formatLogLines(undefined)).toEqual([]);
  });

  it('adds one-based line numbers while preserving each raw log line', () => {
    expect(formatLogLines('INFO first line\nfreeform second line')).toEqual([
      { lineNumber: 1, text: 'INFO first line', severity: 'INFO' },
      { lineNumber: 2, text: 'freeform second line', severity: null },
    ]);
  });

  it('detects severity only when a line clearly begins with a log level', () => {
    expect(getLogSeverity('DEBUG debug details')).toBe('DEBUG');
    expect(getLogSeverity('[WARNING] possible issue')).toBe('WARNING');
    expect(getLogSeverity('ERROR: validation failed')).toBe('ERROR');
    expect(getLogSeverity('critical failure in lowercase')).toBeNull();
    expect(getLogSeverity('prefix INFO later in line')).toBeNull();
  });

  it('preserves unknown and whitespace-only lines unchanged', () => {
    expect(formatLogLines('unknown line\n   \nCRITICAL bad failure')).toEqual([
      { lineNumber: 1, text: 'unknown line', severity: null },
      { lineNumber: 2, text: '   ', severity: null },
      { lineNumber: 3, text: 'CRITICAL bad failure', severity: 'CRITICAL' },
    ]);
  });
});
