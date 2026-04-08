import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

const SELECTED_ANALYSIS_TYPE_ID_PARAM = 'selectedAnalysisTypeId';

/**
 * Controls the analysis type detail drawer via URL query param `atDetail`.
 * - ?atDetail=AT001 → open drawer for analysis type with id AT001
 * - no param or invalid id → drawer closed
 */
export function useAnalysisTypeDetailDrawer() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const selectedAnalysisTypeId = getParam(SELECTED_ANALYSIS_TYPE_ID_PARAM) ?? null;

  const openDetail = useCallback(
    (id: string) => setParams({ [SELECTED_ANALYSIS_TYPE_ID_PARAM]: id }),
    [setParams]
  );

  const closeDetail = useCallback(
    () => setParams({ [SELECTED_ANALYSIS_TYPE_ID_PARAM]: undefined }),
    [setParams]
  );

  return { selectedAnalysisTypeId, openDetail, closeDetail };
}
