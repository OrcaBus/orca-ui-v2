import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export enum LibraryDetailsTabValues {
  WorkflowRuns = 'workflowRuns',
  RelatedLibraries = 'relatedLibraries',
  History = 'history',
}

export const TAB_VALUES = Object.values(LibraryDetailsTabValues);

export function parseLibraryDetailsTabParam(value: string | undefined): LibraryDetailsTabValues {
  if (value === 'files') {
    return LibraryDetailsTabValues.WorkflowRuns;
  }

  if (value && TAB_VALUES.includes(value as LibraryDetailsTabValues)) {
    return value as LibraryDetailsTabValues;
  }
  return LibraryDetailsTabValues.WorkflowRuns;
}

/**
 * Controls the library details page tab via URL query param `tab`.
 * - ?tab=workflowRuns (or no param) → Workflow Runs
 * - ?tab=files → Workflow Runs (legacy)
 * - ?tab=relatedLibraries → Related Libraries
 * - ?tab=history → History
 */
export function useLibraryDetailsTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseLibraryDetailsTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseLibraryDetailsTabParam(id);
      setParams({ tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
