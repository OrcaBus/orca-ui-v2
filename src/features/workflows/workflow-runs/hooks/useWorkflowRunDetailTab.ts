import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const WORKFLOW_RUN_DETAIL_TAB_VALUES = [
  'timeline',
  'libraries',
  'run-context',
  'readsets',
] as const;
export type WorkflowRunDetailTabId = (typeof WORKFLOW_RUN_DETAIL_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): WorkflowRunDetailTabId {
  if (value && WORKFLOW_RUN_DETAIL_TAB_VALUES.includes(value as WorkflowRunDetailTabId)) {
    return value as WorkflowRunDetailTabId;
  }
  return 'timeline';
}

/**
 * Controls the workflow run detail page tab via URL query param `tab`.
 * - ?tab=timeline (or no param) → Timeline
 * - ?tab=libraries → Libraries
 * - ?tab=run-context → Run Context
 * - ?tab=readsets → Readsets
 */
export function useWorkflowRunDetailTab() {
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
