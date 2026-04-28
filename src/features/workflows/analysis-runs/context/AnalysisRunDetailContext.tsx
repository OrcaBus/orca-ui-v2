/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, useCallback, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useAnalysisRunDetailModel, useAnalysisRunCommentListModel } from '../../api/workflows.api';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/ui/Spinner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalysisRunDetailContextValue {
  // Core detail
  analysisRunDetail: ReturnType<typeof useAnalysisRunDetailModel>['data'];
  isLoadingAnalysisRunDetail: boolean;
  // Comments
  analysisRunCommentsData: ReturnType<typeof useAnalysisRunCommentListModel>['data'];
  isLoadingAnalysisRunComments: boolean;
  /**
   * Refetches detail and comments in parallel. Call this after any
   * mutation (e.g. adding a comment) to synchronise all panels.
   */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Context — undefined default forces consumers to be wrapped in the Provider
// ---------------------------------------------------------------------------

const AnalysisRunDetailContext = createContext<AnalysisRunDetailContextValue | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AnalysisRunDetailProvider: FC<PropsWithChildren> = ({ children }) => {
  const { analysisRunOrcabusId } = useParams<{ analysisRunOrcabusId: string }>();

  const {
    data: analysisRunDetail,
    isLoading: isLoadingAnalysisRunDetail,
    refetch: refetchDetail,
  } = useAnalysisRunDetailModel({
    params: { path: { orcabusId: analysisRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!analysisRunOrcabusId },
  });

  const {
    data: analysisRunCommentsData,
    isLoading: isLoadingAnalysisRunComments,
    refetch: refetchComment,
  } = useAnalysisRunCommentListModel({
    params: { path: { orcabusId: analysisRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!analysisRunOrcabusId },
  });

  // Stable callback: refetch all mutable data in parallel after a mutation.
  const refresh = useCallback(() => {
    void Promise.all([refetchDetail(), refetchComment()]);
  }, [refetchDetail, refetchComment]);

  // Block render only during the very first load of the core detail.
  if (isLoadingAnalysisRunDetail) {
    return (
      <div className='h-screen'>
        <SpinnerWithText text='Loading...' />
      </div>
    );
  }

  return (
    <AnalysisRunDetailContext.Provider
      value={{
        analysisRunDetail,
        isLoadingAnalysisRunDetail,
        analysisRunCommentsData,
        isLoadingAnalysisRunComments,
        refresh,
      }}
    >
      {children}
    </AnalysisRunDetailContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook — throws if used outside the Provider
// ---------------------------------------------------------------------------

export const useAnalysisRunDetailContext = (): AnalysisRunDetailContextValue => {
  const ctx = useContext(AnalysisRunDetailContext);
  if (!ctx) {
    throw new Error('useAnalysisRunDetailContext must be used within an AnalysisRunDetailProvider');
  }
  return ctx;
};
