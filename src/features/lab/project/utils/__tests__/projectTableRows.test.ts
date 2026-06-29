import { describe, expect, it } from 'vitest';
import type { ProjectDetailType } from '../../../shared/api/lab.api';
import { createProjectContactRows } from '../projectTableRows';

describe('createProjectContactRows', () => {
  it('keeps every contactSet record as an ordered vertical row', () => {
    const project = {
      contactSet: [
        { orcabusId: 'ctc-1', contactId: 'Solomon', name: 'John Solomon' },
        { orcabusId: 'ctc-2', contactId: 'Dawson', name: 'Mark Dawson' },
      ],
    } as ProjectDetailType;

    expect(createProjectContactRows(project)).toEqual([
      { contactId: 'Solomon', name: 'John Solomon' },
      { contactId: 'Dawson', name: 'Mark Dawson' },
    ]);
  });

  it('falls back to a dash for missing contact values', () => {
    const project = {
      contactSet: [{ orcabusId: 'ctc-1', contactId: 'Grimmond', name: null }],
    } as unknown as ProjectDetailType;

    expect(createProjectContactRows(project)).toEqual([{ contactId: 'Grimmond', name: '-' }]);
  });
});
