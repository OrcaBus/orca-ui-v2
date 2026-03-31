import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

const DETAIL_PARAM = 'atDetail';

/**
 * Controls the analysis type detail drawer via URL query param `atDetail`.
 * - ?atDetail=AT001 → open drawer for analysis type with id AT001
 * - no param or invalid id → drawer closed
 */
export function useAnalysisTypeDetailDrawer() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const detailId = getParam(DETAIL_PARAM) ?? null;

  const openDetail = useCallback((id: string) => setParams({ [DETAIL_PARAM]: id }), [setParams]);

  const closeDetail = useCallback(() => setParams({ [DETAIL_PARAM]: undefined }), [setParams]);

  return { detailId, openDetail, closeDetail };
}
