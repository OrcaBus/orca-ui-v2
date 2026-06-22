/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, useCallback, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import {
  useWorkflowRunDetailModel,
  useWorkflowRunCommentsListModel,
  useWorkflowRunStateListModel,
  useWorkflowRunStateCreationValidMapModel,
  useWorkflowRunRerunValidateModel,
} from '../../shared/api/workflows.api';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkflowRunDetailsContextValue {
  // Core detail
  workflowRunDetail: ReturnType<typeof useWorkflowRunDetailModel>['data'];
  isLoadingWorkflowRunDetail: boolean;
  // Comments
  workflowRunCommentsData: ReturnType<typeof useWorkflowRunCommentsListModel>['data'];
  isLoadingWorkflowRunComments: boolean;
  // States
  workflowRunStatesData: ReturnType<typeof useWorkflowRunStateListModel>['data'];
  isLoadingWorkflowRunStates: boolean;
  // Valid state transitions
  workflowRunStateCreationValidMapData: ReturnType<
    typeof useWorkflowRunStateCreationValidMapModel
  >['data'];
  // Rerun validation
  workflowRunRerunValidMapData: ReturnType<typeof useWorkflowRunRerunValidateModel>['data'];
  /**
   * Refetches detail, comments, and state in parallel. Call this after any
   * mutation (e.g. adding a state or comment) to synchronise all panels.
   */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Context — undefined default forces consumers to be wrapped in the Provider
// ---------------------------------------------------------------------------

const WorkflowRunDetailsContext = createContext<WorkflowRunDetailsContextValue | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const WorkflowRunDetailsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { workflowRunOrcabusId } = useParams<{ workflowRunOrcabusId: string }>();

  const {
    data: workflowRunDetail,
    isLoading: isLoadingWorkflowRunDetail,
    isError: isErrorWorkflowRunDetail,
    error: workflowRunDetailError,
    refetch: refetchDetail,
  } = useWorkflowRunDetailModel({
    params: { path: { orcabusId: workflowRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!workflowRunOrcabusId },
  });

  const {
    data: workflowRunCommentsData,
    isLoading: isLoadingWorkflowRunComments,
    refetch: refetchComment,
  } = useWorkflowRunCommentsListModel({
    params: { path: { orcabusId: workflowRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!workflowRunOrcabusId },
  });

  const {
    data: workflowRunStatesData,
    isLoading: isLoadingWorkflowRunStates,
    refetch: refetchState,
  } = useWorkflowRunStateListModel({
    params: { path: { orcabusId: workflowRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!workflowRunOrcabusId },
  });

  const { data: workflowRunStateCreationValidMapData } = useWorkflowRunStateCreationValidMapModel({
    params: { path: { orcabusId: workflowRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!workflowRunOrcabusId },
  });

  const { data: workflowRunRerunValidMapData } = useWorkflowRunRerunValidateModel({
    params: { path: { orcabusId: workflowRunOrcabusId ?? '' } },
    reactQuery: { enabled: !!workflowRunOrcabusId },
  });

  // Stable callback: refetch all mutable data in parallel after a mutation.
  // useCallback ensures the function reference is stable across renders so
  // consumers memoised with useCallback/useMemo don't re-run unnecessarily.
  const refresh = useCallback(() => {
    void Promise.all([refetchDetail(), refetchComment(), refetchState()]);
  }, [refetchDetail, refetchComment, refetchState]);

  // Block render only during the very first load of the core detail.
  // Comments/states render their own loading states independently.
  const isInitialLoad = isLoadingWorkflowRunDetail;

  if (isInitialLoad) {
    return (
      <div className='h-screen'>
        <SpinnerWithText text='Loading...' />
      </div>
    );
  }

  if (isErrorWorkflowRunDetail || !workflowRunDetail) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to load workflow run details'
          message={
            !isErrorWorkflowRunDetail
              ? 'The requested workflow run details could not be loaded.'
              : undefined
          }
          error={workflowRunDetailError}
          onRetry={() => void refetchDetail()}
        />
      </div>
    );
  }

  return (
    <WorkflowRunDetailsContext.Provider
      value={{
        workflowRunDetail,
        isLoadingWorkflowRunDetail,
        workflowRunCommentsData,
        isLoadingWorkflowRunComments,
        workflowRunStatesData,
        isLoadingWorkflowRunStates,
        workflowRunStateCreationValidMapData,
        workflowRunRerunValidMapData,
        refresh,
      }}
    >
      {children}
    </WorkflowRunDetailsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook — throws if used outside the Provider
// ---------------------------------------------------------------------------

export const useWorkflowRunDetailsContext = (): WorkflowRunDetailsContextValue => {
  const ctx = useContext(WorkflowRunDetailsContext);
  if (!ctx) {
    throw new Error(
      'useWorkflowRunDetailsContext must be used within a WorkflowRunDetailsProvider'
    );
  }
  return ctx;
};
