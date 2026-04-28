import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';

export const WORKFLOWS_TAB_VALUES = [
  'workflow-runs',
  'analysis-runs',
  'workflow-types',
  'analysis-types',
] as const;
export type WorkflowsTabId = (typeof WORKFLOWS_TAB_VALUES)[number];

function parseTabPathSegment(value: string | undefined): WorkflowsTabId {
  if (value && WORKFLOWS_TAB_VALUES.includes(value as WorkflowsTabId)) {
    return value as WorkflowsTabId;
  }
  return 'workflow-runs';
}

/**
 * Controls the workflows page tab via URL path segment `:tab`.
 * - /workflows/workflow-runs (or /workflows) → Workflow Runs
 * - /workflows/analysis-runs → Analysis Runs
 * - /workflows/workflow-types → Workflow Types
 * - /workflows/analysis-types → Analysis Types
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
