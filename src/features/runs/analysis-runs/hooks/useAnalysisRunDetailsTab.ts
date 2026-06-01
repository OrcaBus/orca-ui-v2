import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const ANALYSIS_RUN_DETAILS_TAB_VALUES = [
  'timeline',
  'workflow-runs',
  'libraries',
  'run-context',
  'readsets',
] as const;
export type AnalysisRunDetailsTabId = (typeof ANALYSIS_RUN_DETAILS_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): AnalysisRunDetailsTabId {
  if (value && ANALYSIS_RUN_DETAILS_TAB_VALUES.includes(value as AnalysisRunDetailsTabId)) {
    return value as AnalysisRunDetailsTabId;
  }
  return 'timeline';
}

/**
 * Controls the analysis run details page tab via URL query param `tab`.
 * - (no param) → Timeline (default)
 * - ?tab=workflow-runs → Workflow Runs
 * - ?tab=libraries → Libraries
 * - ?tab=run-context → Run Context
 * - ?tab=readsets → Readsets
 */
export function useAnalysisRunDetailsTab() {
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
