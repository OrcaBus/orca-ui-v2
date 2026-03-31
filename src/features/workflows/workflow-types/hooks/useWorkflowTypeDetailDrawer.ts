import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

const DETAIL_PARAM = 'wtDetail';

/**
 * Controls the workflow type detail drawer via URL query param `wtDetail`.
 * - ?wtDetail=WT001 → open drawer for workflow type with id WT001
 * - no param or invalid id → drawer closed
 */
export function useWorkflowTypeDetailDrawer() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const detailId = getParam(DETAIL_PARAM) ?? null;

  const openDetail = useCallback((id: string) => setParams({ [DETAIL_PARAM]: id }), [setParams]);

  const closeDetail = useCallback(() => setParams({ [DETAIL_PARAM]: undefined }), [setParams]);

  return { detailId, openDetail, closeDetail };
}
