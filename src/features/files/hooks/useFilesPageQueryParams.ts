import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_INFO } from '@/utils/constants';
import { useFilesListQueryParams } from './useFilesListQueryParams';

export function useFilesPageQueryParams() {
  const filesQueryParams = useFilesListQueryParams();
  const { getBooleanParam, setParams } = useQueryParams();

  const openInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: true }, { resetPagination: false });
  }, [setParams]);

  const closeInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true });
  }, [setParams]);

  return {
    ...filesQueryParams,
    isInfoDrawerOpen: getBooleanParam(PARAM_INFO),
    openInfoDrawer,
    closeInfoDrawer,
  };
}
