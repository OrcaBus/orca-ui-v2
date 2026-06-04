/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, useCallback, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useCaseDetailModel, useCaseStatesModel } from '../api/cases.api';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CaseDetailsContextValue {
  // Core detail
  caseDetail: ReturnType<typeof useCaseDetailModel>['data'];
  isLoadingCaseDetail: boolean;
  // States
  caseStatesData: ReturnType<typeof useCaseStatesModel>['data'];
  isLoadingCaseStates: boolean;
  /**
   * Refetches detail and states in parallel. Call this after any
   * mutation (e.g. adding a state or comment) to synchronise all panels.
   */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Context — undefined default forces consumers to be wrapped in the Provider
// ---------------------------------------------------------------------------

const CaseDetailsContext = createContext<CaseDetailsContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const CaseDetailsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();

  const {
    data: caseDetail,
    isLoading: isLoadingCaseDetail,
    isError: isErrorCaseDetail,
    error: caseDetailError,
    refetch: refetchDetail,
  } = useCaseDetailModel({
    params: { path: { orcabusId: caseOrcabusId ?? '' } },
    reactQuery: { enabled: !!caseOrcabusId },
  });

  const {
    data: caseStatesData,
    isLoading: isLoadingCaseStates,
    refetch: refetchStates,
  } = useCaseStatesModel({
    params: {
      path: { orcabusId: caseOrcabusId ?? '' },
      query: { rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE },
    },
    reactQuery: { enabled: !!caseOrcabusId },
  });

  // Stable callback: refetch all mutable data in parallel after a mutation.
  const refresh = useCallback(() => {
    void Promise.all([refetchDetail(), refetchStates()]);
  }, [refetchDetail, refetchStates]);

  // Block render only during the very first load of the core detail.
  if (isLoadingCaseDetail) {
    return (
      <div className='h-screen'>
        <SpinnerWithText text='Loading...' />
      </div>
    );
  }

  if (isErrorCaseDetail || !caseDetail) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to load case details'
          message={
            !isErrorCaseDetail ? 'The requested case details could not be loaded.' : undefined
          }
          error={caseDetailError}
          onRetry={() => void refetchDetail()}
        />
      </div>
    );
  }

  return (
    <CaseDetailsContext.Provider
      value={{
        caseDetail,
        isLoadingCaseDetail,
        caseStatesData,
        isLoadingCaseStates,
        refresh,
      }}
    >
      {children}
    </CaseDetailsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook — throws if used outside the Provider
// ---------------------------------------------------------------------------

export const useCaseDetailsContext = (): CaseDetailsContextValue => {
  const ctx = useContext(CaseDetailsContext);
  if (!ctx) {
    throw new Error('useCaseDetailsContext must be used within a CaseDetailsProvider');
  }
  return ctx;
};
