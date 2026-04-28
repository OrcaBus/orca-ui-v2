import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const ANALYSIS_RUN_DETAIL_TAB_VALUES = [
  'timeline',
  'workflow-runs',
  'libraries',
  'run-context',
  'readsets',
] as const;
export type AnalysisRunDetailTabId = (typeof ANALYSIS_RUN_DETAIL_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): AnalysisRunDetailTabId {
  if (value && ANALYSIS_RUN_DETAIL_TAB_VALUES.includes(value as AnalysisRunDetailTabId)) {
    return value as AnalysisRunDetailTabId;
  }
  return 'timeline';
}

/**
 * Controls the analysis run detail page tab via URL query param `tab`.
 * - (no param) → Timeline (default)
 * - ?tab=workflow-runs → Workflow Runs
 * - ?tab=libraries → Libraries
 * - ?tab=run-context → Run Context
 * - ?tab=readsets → Readsets
 */
export function useAnalysisRunDetailTab() {
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
