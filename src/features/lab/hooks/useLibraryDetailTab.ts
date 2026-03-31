import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export const LIBRARY_DETAIL_TAB_VALUES = ['workflows', 'files', 'related', 'history'] as const;
export type LibraryDetailTabId = (typeof LIBRARY_DETAIL_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): LibraryDetailTabId {
  if (value && LIBRARY_DETAIL_TAB_VALUES.includes(value as LibraryDetailTabId)) {
    return value as LibraryDetailTabId;
  }
  return 'workflows';
}

/**
 * Controls the library detail page tab via URL query param `tab`.
 * - ?tab=workflows (or no param) → Workflow Runs
 * - ?tab=files → Files
 * - ?tab=related → Related Libraries
 * - ?tab=history → History
 */
export function useLibraryDetailTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === 'workflows' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
