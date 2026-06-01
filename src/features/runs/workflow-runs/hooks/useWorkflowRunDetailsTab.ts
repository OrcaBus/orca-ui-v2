import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export enum WorkflowRunDetailsTabValues {
  Timeline = 'timeline',
  Libraries = 'libraries',
  RunContext = 'run-context',
  Readsets = 'readsets',
}

export const TAB_VALUES = Object.values(WorkflowRunDetailsTabValues);

function parseTabParam(value: string | undefined): WorkflowRunDetailsTabValues {
  if (value && TAB_VALUES.includes(value as WorkflowRunDetailsTabValues)) {
    return value as WorkflowRunDetailsTabValues;
  }
  return WorkflowRunDetailsTabValues.Timeline;
}

/**
 * Controls the workflow run details page tab via URL query param `tab`.
 * - ?tab=timeline (or no param) → Timeline
 * - ?tab=libraries → Libraries
 * - ?tab=run-context → Run Context
 * - ?tab=readsets → Readsets
 */
export function useWorkflowRunDetailsTab() {
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
