import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_INFO } from '@/utils/constants';
import { useSequenceListQueryParams } from './useSequenceListQueryParams';

export function useSequenceRunsPageQueryParams() {
  const sequenceQueryParams = useSequenceListQueryParams();
  const { getBooleanParam, setParams } = useQueryParams();

  const openInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: true }, { resetPagination: false });
  }, [setParams]);

  const closeInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true });
  }, [setParams]);

  return {
    ...sequenceQueryParams,
    isInfoDrawerOpen: getBooleanParam(PARAM_INFO),
    openInfoDrawer,
    closeInfoDrawer,
  };
}
