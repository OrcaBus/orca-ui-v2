import { describe, expect, it } from 'vitest';
import { SUBJECT_FILTER_FIELDS } from '../subjectFilterFields';

describe('SUBJECT_FILTER_FIELDS', () => {
  it('defines the requested subject filters with comma-entry placeholders', () => {
    expect(SUBJECT_FILTER_FIELDS).toEqual([
      {
        key: 'orcabusId',
        label: 'Orcabus ID',
        placeholder: 'Enter Orcabus IDs...',
      },
      {
        key: 'subjectId',
        label: 'Subject ID',
        placeholder: 'Enter Subject IDs...',
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
