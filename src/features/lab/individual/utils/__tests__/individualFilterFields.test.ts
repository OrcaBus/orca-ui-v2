import { describe, expect, it } from 'vitest';
import { INDIVIDUAL_FILTER_FIELDS } from '../individualFilterFields';

describe('INDIVIDUAL_FILTER_FIELDS', () => {
  it('defines only Orcabus ID and Individual ID text filters', () => {
    expect(INDIVIDUAL_FILTER_FIELDS).toEqual([
      {
        type: 'text',
        key: 'orcabusId',
        label: 'Orcabus ID',
        placeholder: 'Enter Orcabus IDs...',
      },
      {
        type: 'text',
        key: 'individualId',
        label: 'Individual ID',
        placeholder: 'Enter Individual IDs...',
      },
    ]);
  });
});
