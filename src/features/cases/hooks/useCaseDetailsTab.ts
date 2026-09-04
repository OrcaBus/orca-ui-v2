import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export enum CaseDetailsTabValues {
  OVERVIEW = 'overview',
  METADATA = 'metadata',
  PENDING = 'pending',
  FILES = 'files',
  STATES = 'states',
  RUNS = 'runs',
  USERS = 'users',
}

export const CASE_DETAILS_TAB_VALUES_ARRAY = Object.values(CaseDetailsTabValues);

function parseTabParam(value: string | undefined): CaseDetailsTabValues {
  if (value && CASE_DETAILS_TAB_VALUES_ARRAY.includes(value as CaseDetailsTabValues)) {
    return value as CaseDetailsTabValues;
  }
  return CaseDetailsTabValues.OVERVIEW;
}

/**
 * Controls the case details page tab via URL query param `tab`.
 * - ?tab=overview (or no param) → Overview
 * - ?tab=metadata → Metadata (linked libraries)
 * - ?tab=pending → Pending (unresolved external entities)
 * - ?tab=runs → Runs (linked sequence and workflow runs)
 * - ?tab=files → Files
 * - ?tab=timeline → Timeline
 * - ?tab=users → Users
 *
 * An unrecognized `tab` value (including the retired `libraries`/`workflows`/
 * `sequences` values) renders the Overview tab but the raw param string is never rewritten
 * in the URL: `setParams` is only ever called from `setActiveTab` (a user
 * action), never from the parse path, so an invalid incoming param is left
 * untouched by construction.
 */
export function useCaseDetailsTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === CaseDetailsTabValues.OVERVIEW ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
