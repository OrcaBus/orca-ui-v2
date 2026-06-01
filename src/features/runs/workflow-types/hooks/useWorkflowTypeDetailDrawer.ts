import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';

const SELECTED_WORKFLOW_TYPE_ID_PARAM = 'selectedWorkflowTypeId';

/**
 * Controls the workflow type detail drawer via URL query param `selectedWorkflowTypeId`.
 * - ?selectedWorkflowTypeId=WT001 → open drawer for workflow type with id WT001
 * - no param or invalid id → drawer closed
 */
export function useWorkflowTypeDetailDrawer() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const selectedWorkflowTypeId = getParam(SELECTED_WORKFLOW_TYPE_ID_PARAM) ?? null;

  const openDetail = useCallback(
    (id: string) => setParams({ [SELECTED_WORKFLOW_TYPE_ID_PARAM]: id }),
    [setParams]
  );

  const closeDetail = useCallback(
    () => setParams({ [SELECTED_WORKFLOW_TYPE_ID_PARAM]: undefined }),
    [setParams]
  );

  return { selectedWorkflowTypeId, openDetail, closeDetail };
}
