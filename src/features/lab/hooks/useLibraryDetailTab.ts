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
 * - /lab/libraries/:libraryOrcabusId (or /lab/libraries/:libraryOrcabusId/workflows) → Workflow Runs
 * - /lab/libraries/:libraryOrcabusId/files → Files
 * - /lab/libraries/:libraryOrcabusId/related → Related Libraries
 * - /lab/libraries/:libraryOrcabusId/history → History
 */
export function useLibraryDetailTab() {
  const { libraryOrcabusId, tab } = useParams<{ libraryOrcabusId?: string; tab?: string }>();
  const navigate = useNavigate();
  const activeTab = useMemo(() => parseTabPathSegment(tab), [tab]);

  const setActiveTab = useCallback(
    (id: string) => {
      const nextTab = parseTabPathSegment(id);
      if (!libraryOrcabusId) return;
      void navigate(`/lab/libraries/${libraryOrcabusId}/${nextTab}`);
    },
    [navigate, libraryOrcabusId]
  );

  return { activeTab, setActiveTab };
}
