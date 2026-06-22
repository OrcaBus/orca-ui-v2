import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const LAB_TAB_VALUES = ['library', 'subject', 'individual', 'sample', 'project'] as const;
export type LabTabId = (typeof LAB_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): LabTabId {
  if (value && LAB_TAB_VALUES.includes(value as LabTabId)) {
    return value as LabTabId;
  }
  return 'library';
}

/**
 * Controls the lab page tab via URL query param `tab`.
 * - ?tab=library (or no param) → Library
 * - ?tab=subject → Subject
 * - ?tab=individual → Individual
 * - ?tab=sample → Sample
 * - ?tab=project → Project
 */
export function useLabTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === 'library' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
