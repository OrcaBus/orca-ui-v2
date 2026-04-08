import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';

export const LIBRARY_DETAIL_TAB_VALUES = ['workflows', 'files', 'related', 'history'] as const;
export type LibraryDetailTabId = (typeof LIBRARY_DETAIL_TAB_VALUES)[number];

function parseTabPathSegment(value: string | undefined): LibraryDetailTabId {
  if (value && LIBRARY_DETAIL_TAB_VALUES.includes(value as LibraryDetailTabId)) {
    return value as LibraryDetailTabId;
  }
  return 'workflows';
}

/**
 * Controls the library detail page tab via URL path segment `:tab`.
 * - /lab/:orcabusId (or /lab/:orcabusId/workflows) → Workflow Runs
 * - /lab/:orcabusId/files → Files
 * - /lab/:orcabusId/related → Related Libraries
 * - /lab/:orcabusId/history → History
 */
export function useLibraryDetailTab() {
  const { orcabusId, tab } = useParams<{ orcabusId?: string; tab?: string }>();
  const navigate = useNavigate();
  const activeTab = useMemo(() => parseTabPathSegment(tab), [tab]);

  const setActiveTab = useCallback(
    (id: string) => {
      const nextTab = parseTabPathSegment(id);
      if (!orcabusId) return;
      void navigate(`/lab/${orcabusId}/${nextTab}`);
    },
    [navigate, orcabusId]
  );

  return { activeTab, setActiveTab };
}
