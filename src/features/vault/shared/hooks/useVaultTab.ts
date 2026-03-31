import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

export const VAULT_TAB_VALUES = ['lims', 'bams', 'fastqs', 'workflows'] as const;
export type VaultTabId = (typeof VAULT_TAB_VALUES)[number];

function parseTabParam(value: string | undefined): VaultTabId {
  if (value && VAULT_TAB_VALUES.includes(value as VaultTabId)) {
    return value as VaultTabId;
  }
  return 'lims';
}

/**
 * Controls the vault page tab via URL query param `tab`.
 * - ?tab=lims (or no param) → LIMS
 * - ?tab=bams → BAMs
 * - ?tab=fastqs → FASTQs
 * - ?tab=workflows → Workflows
 */
export function useVaultTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === 'lims' ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
