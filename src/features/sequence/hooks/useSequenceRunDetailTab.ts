import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export const SEQUENCE_RUN_DETAIL_TAB_VALUES = [
  'timeline',
  'samplesheets',
  'workflows',
  'libraries',
] as const;
export type SequenceRunDetailTabId = (typeof SEQUENCE_RUN_DETAIL_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): SequenceRunDetailTabId {
  if (value && SEQUENCE_RUN_DETAIL_TAB_VALUES.includes(value as SequenceRunDetailTabId)) {
    return value as SequenceRunDetailTabId;
  }
  return 'timeline';
}

/**
 * Controls the sequence run detail page tab via URL query param `tab`.
 * - ?tab=timeline (or no param) → Timeline
 * - ?tab=samplesheets → Sample Sheets
 * - ?tab=workflows → Workflow Runs
 * - ?tab=libraries → Related Libraries
 */
export function useSequenceRunDetailTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === 'timeline' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
