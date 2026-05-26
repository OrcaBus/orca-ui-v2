import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export enum CaseDetailsTabValues {
  TIMELINES = 'timelines',
  LIBRARIES = 'libraries',
  WORKFLOWS = 'workflows',
  USERS = 'users',
}

export const CASE_DETAILS_TAB_VALUES_ARRAY = Object.values(CaseDetailsTabValues);

function parseTabParam(value: string | undefined): CaseDetailsTabValues {
  if (value && CASE_DETAILS_TAB_VALUES_ARRAY.includes(value as CaseDetailsTabValues)) {
    return value as CaseDetailsTabValues;
  }
  return CaseDetailsTabValues.TIMELINES;
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
      setParams({ tab: tab === CaseDetailsTabValues.LIBRARIES ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
