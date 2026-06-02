import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_INFO } from '@/utils/constants';
import { useAnalysisRunsListQueryParams } from './useAnalysisRunsListQueryParams';

export function useAnalysisRunsPageQueryParams() {
  const analysisRunsQueryParams = useAnalysisRunsListQueryParams();
  const { getBooleanParam, setParams } = useQueryParams();

  const openInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: true }, { resetPagination: false });
  }, [setParams]);

  const closeInfoDrawer = useCallback(() => {
    setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true });
  }, [setParams]);

  return {
    ...analysisRunsQueryParams,
    isInfoDrawerOpen: getBooleanParam(PARAM_INFO),
    openInfoDrawer,
    closeInfoDrawer,
  };
}
