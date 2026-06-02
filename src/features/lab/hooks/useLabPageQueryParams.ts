import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_INFO } from '@/utils/constants';
import { useLabQueryParams } from './useLabQueryParams';

export function useLabPageQueryParams() {
  const labQueryParams = useLabQueryParams();
  const { getBooleanParam, setParams } = useQueryParams();

  const openInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: true }, { resetPagination: false });
  }, [setParams]);

  const closeInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true });
  }, [setParams]);

  return {
    ...labQueryParams,
    isInfoDrawerOpen: getBooleanParam(PARAM_INFO),
    openInfoDrawer,
    closeInfoDrawer,
  };
}
