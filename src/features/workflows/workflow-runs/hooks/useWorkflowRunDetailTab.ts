import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export enum WorkflowRunDetailTabValues {
  Timeline = 'timeline',
  Libraries = 'libraries',
  RunContext = 'run-context',
  Readsets = 'readsets',
}

export const TAB_VALUES = Object.values(WorkflowRunDetailTabValues);

function parseTabParam(value: string | undefined): WorkflowRunDetailTabValues {
  if (value && TAB_VALUES.includes(value as WorkflowRunDetailTabValues)) {
    return value as WorkflowRunDetailTabValues;
  }
  return WorkflowRunDetailTabValues.Timeline;
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
      setParams({ tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
