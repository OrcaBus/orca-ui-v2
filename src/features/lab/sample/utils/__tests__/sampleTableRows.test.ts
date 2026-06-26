import { describe, expect, it } from 'vitest';
import type { SampleDetailType } from '../../../shared/api/lab.api';
import { createSampleLibraryRows, joinSampleTableValues } from '../sampleTableRows';

describe('createSampleLibraryRows', () => {
  it('keeps every librarySet record as an ordered vertical row', () => {
    const sample = {
      librarySet: [
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
        },
      ],
    } as SampleDetailType;

    expect(createSampleLibraryRows(sample)).toEqual([
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
      },
    ]);
  });

  it('falls back to a dash for missing library values', () => {
    const sample = {
      librarySet: [
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
        },
      ],
    } as unknown as SampleDetailType;

    expect(createSampleLibraryRows(sample)).toEqual([
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
      },
    ]);
  });
});

describe('joinSampleTableValues', () => {
  it('drops dash placeholders and joins the remaining values with a comma', () => {
    expect(joinSampleTableValues(['L2600361', '-', 'L2600367'])).toBe('L2600361, L2600367');
  });
});
