import { describe, expect, it } from 'vitest';
import type { SubjectDetailType } from '../../../shared/api/lab.api';
import { createSubjectIndividualRows, createSubjectLibraryRows } from '../subjectTableRows';

describe('createSubjectIndividualRows', () => {
  it('keeps every individualSet record as an ordered vertical row', () => {
    const subject = {
      individualSet: [
        { orcabusId: 'ind-1', individualId: 'SBJ000001', source: 'blood' },
        { orcabusId: 'ind-2', individualId: 'SBJ000002', source: 'tissue' },
      ],
    } as SubjectDetailType;

    expect(createSubjectIndividualRows(subject)).toEqual([
      { individualId: 'SBJ000001', source: 'blood' },
      { individualId: 'SBJ000002', source: 'tissue' },
    ]);
  });
});

describe('createSubjectLibraryRows', () => {
  it('keeps every librarySet record as an ordered vertical row', () => {
    const subject = {
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
    } as SubjectDetailType;

    expect(createSubjectLibraryRows(subject)).toEqual([
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
});
