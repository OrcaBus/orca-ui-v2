import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_INFO } from '@/utils/constants';
import { useRunContextsListQueryParams } from './useRunContextsListQueryParams';

export function useRunContextsPageQueryParams() {
  const runContextsQueryParams = useRunContextsListQueryParams();
  const { getBooleanParam, setParams } = useQueryParams();

  const openInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: true }, { resetPagination: false });
  }, [setParams]);

  const closeInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true });
  }, [setParams]);

  return {
    ...runContextsQueryParams,
    isInfoDrawerOpen: getBooleanParam(PARAM_INFO),
    openInfoDrawer,
    closeInfoDrawer,
  };
}
