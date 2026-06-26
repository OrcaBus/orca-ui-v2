import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

export const LAB_TAB_VALUES = ['library', 'subject', 'individual', 'sample', 'project'] as const;
export type LabTabId = (typeof LAB_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): LabTabId {
  if (value && LAB_TAB_VALUES.includes(value as LabTabId)) {
    return value as LabTabId;
  }
  return 'library';
}

/**
 * Controls the lab page tab via URL path segment.
 * - /library (or no segment) → Library
 * - /subject → Subject
 * - /individual → Individual
 * - /sample → Sample
 * - /project → Project
 */
export function useLabTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    // pathname is like /lab, /lab/subject, /lab/individual, etc.
    const segments = location.pathname.split('/').filter(Boolean);
    // segments[0] = 'lab', segments[1] = tab segment (if any)
    return parseTabParam(segments[1]);
  }, [location.pathname]);

  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      void navigate(tab === 'library' ? '/lab' : `/lab/${tab}`);
    },
    [navigate]
  );

  return { activeTab, setActiveTab };
}
