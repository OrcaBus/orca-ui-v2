import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export const CASE_DETAILS_TAB_VALUES = ['libraries', 'workflows', 'files'] as const;
export type CaseDetailsTabId = (typeof CASE_DETAILS_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): CaseDetailsTabId {
  if (value && CASE_DETAILS_TAB_VALUES.includes(value as CaseDetailsTabId)) {
    return value as CaseDetailsTabId;
  }
  return 'libraries';
}

/**
 * Controls the case details page tab via URL query param `tab`.
 * - ?tab=libraries (or no param) → Libraries
 * - ?tab=workflows → Workflow Runs
 * - ?tab=files → Files
 */
export function useCaseDetailsTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === 'libraries' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
