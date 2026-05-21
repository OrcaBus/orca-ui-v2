import { describe, expect, it } from 'vitest';
import { LibraryDetailsTabValues, parseLibraryDetailsTabParam } from '../useLibraryDetailsTab';

describe('parseLibraryDetailsTabParam', () => {
  it('resolves the legacy files tab to workflow runs', () => {
    expect(parseLibraryDetailsTabParam('files')).toBe(LibraryDetailsTabValues.WorkflowRuns);
  });

  it('keeps supported non-workflow-runs tabs', () => {
    expect(parseLibraryDetailsTabParam('history')).toBe(LibraryDetailsTabValues.History);
    expect(parseLibraryDetailsTabParam('relatedLibraries')).toBe(
      LibraryDetailsTabValues.RelatedLibraries
    );
  });
});
