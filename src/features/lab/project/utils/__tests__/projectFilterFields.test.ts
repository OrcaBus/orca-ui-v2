import { describe, expect, it } from 'vitest';
import { PROJECT_FILTER_FIELDS } from '../projectFilterFields';

describe('PROJECT_FILTER_FIELDS', () => {
  it('defines the requested project filters with comma-entry placeholders', () => {
    expect(PROJECT_FILTER_FIELDS).toEqual([
      {
        key: 'orcabusId',
        label: 'Orcabus ID',
        placeholder: 'Enter Orcabus IDs...',
      },
      {
        key: 'projectId',
        label: 'Project ID',
        placeholder: 'Enter Project IDs...',
      },
      {
        key: 'name',
        label: 'Name',
        placeholder: 'Enter Project Names...',
      },
    ]);
  });
});
