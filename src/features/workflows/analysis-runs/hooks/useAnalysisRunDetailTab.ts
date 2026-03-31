import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const ANALYSIS_RUN_DETAIL_TAB_VALUES = [
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
  return 'workflow-runs';
}

/**
 * Controls the analysis run detail page tab via URL query param `tab`.
 * - ?tab=workflow-runs (or no param) → Workflow Runs
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
      setParams({ tab: tab === 'workflow-runs' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
