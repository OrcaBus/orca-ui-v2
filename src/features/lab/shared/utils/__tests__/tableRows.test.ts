import { describe, expect, it } from 'vitest';
import type { SubjectDetailType } from '../../api/lab.api';
import { createLibraryRows, joinTableValues, toDisplayValue } from '../tableRows';

describe('toDisplayValue', () => {
  it('trims string values', () => {
    expect(toDisplayValue('  L2600361  ')).toBe('L2600361');
  });

  it('stringifies numbers', () => {
    expect(toDisplayValue(12)).toBe('12');
  });

  it('falls back to a dash for nullish or blank values', () => {
    expect(toDisplayValue(null)).toBe('-');
    expect(toDisplayValue(undefined)).toBe('-');
    expect(toDisplayValue('   ')).toBe('-');
  });
});

describe('joinTableValues', () => {
  it('drops dash placeholders and joins the remaining values with a comma', () => {
    expect(joinTableValues(['L2600361', '-', 'L2600367'])).toBe('L2600361, L2600367');
  });
});

describe('createLibraryRows', () => {
  it('keeps every librarySet record as an ordered vertical row', () => {
    const librarySet = [
      {
        orcabusId: 'lib-1',
        libraryId: 'L2600361',
        phenotype: 'tumor',
        workflow: 'clinical',
        quality: 'poor',
        type: 'WTS',
        assay: 'ISTRL',
        coverage: 12,
        overrideCycles: 'N1Y150;I10;I10;N1Y150',
        requestFormId: 'RF-1',
      },
      {
        orcabusId: 'lib-2',
        libraryId: 'L2600367',
        phenotype: 'normal',
        workflow: 'clinical',
        quality: 'good',
        type: 'WGS',
        assay: 'TsqNano',
        coverage: 40,
        overrideCycles: 'Y151;I8N2;I8N2;Y151',
        requestFormId: 'RF-2',
      },
    ] as unknown as SubjectDetailType['librarySet'];

    expect(createLibraryRows(librarySet)).toEqual([
      {
        orcabusId: 'lib-1',
        libraryId: 'L2600361',
        phenotype: 'tumor',
        workflow: 'clinical',
        quality: 'poor',
        type: 'WTS',
        assay: 'ISTRL',
        coverage: '12',
        overrideCycles: 'N1Y150;I10;I10;N1Y150',
        requestFormId: 'RF-1',
      },
      {
        orcabusId: 'lib-2',
        libraryId: 'L2600367',
        phenotype: 'normal',
        workflow: 'clinical',
        quality: 'good',
        type: 'WGS',
        assay: 'TsqNano',
        coverage: '40',
        overrideCycles: 'Y151;I8N2;I8N2;Y151',
        requestFormId: 'RF-2',
      },
    ]);
  });

  it('falls back to a dash for missing library values while keeping orcabusId', () => {
    const librarySet = [
      {
        orcabusId: 'lib-1',
        libraryId: null,
        phenotype: null,
        workflow: undefined,
        quality: '',
        type: null,
        assay: null,
        coverage: null,
        overrideCycles: null,
        requestFormId: null,
      },
    ] as unknown as SubjectDetailType['librarySet'];

    expect(createLibraryRows(librarySet)).toEqual([
      {
        orcabusId: 'lib-1',
        libraryId: '-',
        phenotype: '-',
        workflow: '-',
        quality: '-',
        type: '-',
        assay: '-',
        coverage: '-',
        overrideCycles: '-',
        requestFormId: '-',
      },
    ]);
  });
});
