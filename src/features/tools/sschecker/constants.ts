import type { LoggingLevel, ValidationResult } from './types';

export const VERSION = 'v1.2.0';

export const LEVEL_ORDER: LoggingLevel[] = ['debug', 'info', 'warning', 'error', 'critical'];

export const MOCK_RESULTS: ValidationResult[] = [
  { severity: 'debug', message: 'Starting sample sheet validation process' },
  { severity: 'debug', message: 'Parsing CSV headers and data rows' },
  { severity: 'info', message: 'Sample sheet format is valid' },
  {
    severity: 'info',
    message: 'All required columns present: Sample_ID, Sample_Name, index, index2',
  },
  { severity: 'info', message: 'Found 24 samples in sample sheet' },
  {
    severity: 'warning',
    message: "Sample 'NGS-003' has low read count allocation (< 5M reads expected)",
    line: 12,
    location: 'Sample_ID column',
  },
  {
    severity: 'warning',
    message: "Index collision detected: i7 index 'ATCACG' used by multiple samples",
    line: 8,
    location: 'index column',
  },
  {
    severity: 'error',
    message: "Duplicate sample ID found: 'NGS-001'",
    line: 15,
    location: 'Sample_ID column',
  },
  {
    severity: 'critical',
    message: 'Invalid character in Sample_Name field: special characters not allowed',
    line: 18,
    location: 'Sample_Name column',
  },
];
