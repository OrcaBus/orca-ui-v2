import { describe, expect, it } from 'vitest';
import { SAMPLE_FILTER_FIELDS } from '../sampleFilterFields';

describe('SAMPLE_FILTER_FIELDS', () => {
  it('defines the requested sample filters with comma-entry placeholders', () => {
    expect(SAMPLE_FILTER_FIELDS).toEqual([
      {
        key: 'orcabusId',
        label: 'Orcabus ID',
        placeholder: 'Enter Orcabus IDs...',
      },
      {
        key: 'sampleId',
        label: 'Sample ID',
        placeholder: 'Enter Sample IDs...',
      },
      {
        key: 'individualId',
        label: 'Individual ID (SBJ ID)',
        placeholder: 'Enter Individual IDs...',
      },
      {
        key: 'libraryId',
        label: 'Library ID',
        placeholder: 'Enter Library IDs...',
      },
    ]);
  });
});
