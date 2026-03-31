import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';

export const WORKFLOWS_TAB_VALUES = [
  'workflowRuns',
  'analysisRuns',
  'workflowTypes',
  'analysisTypes',
] as const;
export type WorkflowsTabId = (typeof WORKFLOWS_TAB_VALUES)[number];

function parseTabPathSegment(value: string | undefined): WorkflowsTabId {
  if (value && WORKFLOWS_TAB_VALUES.includes(value as WorkflowsTabId)) {
    return value as WorkflowsTabId;
  }
  return 'workflowRuns';
}

/**
 * Controls the workflows page tab via URL path segment `:tab`.
 * - /workflows/workflowRuns (or /workflows) → Workflow Runs
 * - /workflows/analysisRuns → Analysis Runs
 * - /workflows/workflowTypes → Workflow Types
 * - /workflows/analysisTypes → Analysis Types
 */
export function useWorkflowsTab() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = useMemo(() => parseTabPathSegment(tab), [tab]);

  const setActiveTab = useCallback(
    (id: string) => {
      const nextTab = parseTabPathSegment(id);
      void navigate(`/workflows/${nextTab}`);
    },
    [navigate]
  );

  return { activeTab, setActiveTab };
}
