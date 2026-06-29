/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, useCallback, useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import type { FC, PropsWithChildren } from 'react';
import {
  useSequenceRunByInstrumentRunIdModel,
  useSequenceRunCommentsByInstrumentRunIdModel,
  useSequenceRunStatesByInstrumentRunIdModel,
  useSequenceRunStateValidMapModel,
} from '../../shared/api/sequence.api';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SequenceRunDetailsContextValue {
  // Sequence runs for instrument run
  sequenceRunData: ReturnType<typeof useSequenceRunByInstrumentRunIdModel>['data'];
  isLoadingSequenceRun: boolean;
  // Comments
  sequenceRunCommentsData: ReturnType<typeof useSequenceRunCommentsByInstrumentRunIdModel>['data'];
  isLoadingSequenceRunComments: boolean;
  // States
  sequenceRunStatesData: ReturnType<typeof useSequenceRunStatesByInstrumentRunIdModel>['data'];
  isLoadingSequenceRunStates: boolean;
  // Valid state transitions
  sequenceRunStateValidMapData: ReturnType<typeof useSequenceRunStateValidMapModel>['data'];
  /**
   * The most recent sequence run that has a status (runs without status are
   * placeholder/edit-only records and should be excluded).
   */
  latestSequenceRun: ReturnType<typeof useSequenceRunByInstrumentRunIdModel>['data'] extends
    (infer T)[] | undefined
    ? T | null
    : null;
  /**
   * Refetches sequence runs, comments, and states in parallel. Call this after
   * any mutation (e.g. adding a state or comment) to synchronise all panels.
   */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Context — undefined default forces consumers to be wrapped in the Provider
// ---------------------------------------------------------------------------

const SequenceRunDetailsContext = createContext<SequenceRunDetailsContextValue | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const SequenceRunDetailsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();

  const {
    data: sequenceRunData,
    isLoading: isLoadingSequenceRun,
    isError: isErrorSequenceRun,
    error: sequenceRunError,
    refetch: refetchSequenceRun,
  } = useSequenceRunByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId ?? '' } },
    reactQuery: { enabled: !!instrumentRunId },
  });

  const {
    data: sequenceRunCommentsData,
    isLoading: isLoadingSequenceRunComments,
    refetch: refetchComments,
  } = useSequenceRunCommentsByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId ?? '' } },
    reactQuery: { enabled: !!instrumentRunId },
  });

  const {
    data: sequenceRunStatesData,
    isLoading: isLoadingSequenceRunStates,
    refetch: refetchStates,
  } = useSequenceRunStatesByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId ?? '' } },
    reactQuery: { enabled: !!instrumentRunId },
  });

  const { data: sequenceRunStateValidMapData } = useSequenceRunStateValidMapModel({
    params: { path: { instrumentRunId: instrumentRunId ?? '' } },
    reactQuery: { enabled: !!instrumentRunId },
  });

  // Latest run with a real status (runs without status are placeholder/edit-only).
  const latestSequenceRun = useMemo(() => {
    const withStatus = sequenceRunData?.filter((run) => run.status) ?? [];
    if (!withStatus.length) return null;
    return [...withStatus].sort((a, b) =>
      dayjs(a.startTime ?? 0).isBefore(dayjs(b.startTime ?? 0)) ? 1 : -1
    )[0];
  }, [sequenceRunData]);

  // Stable callback: refetch all mutable data in parallel after a mutation.
  const refresh = useCallback(() => {
    void Promise.all([refetchSequenceRun(), refetchComments(), refetchStates()]);
  }, [refetchSequenceRun, refetchComments, refetchStates]);

  // Block render only during the very first load of the core sequence run data.
  if (isLoadingSequenceRun) {
    return (
      <div className='h-screen'>
        <SpinnerWithText text='Loading...' />
      </div>
    );
  }

  if (isErrorSequenceRun) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to load sequence run details'
          error={sequenceRunError}
          onRetry={() => void refetchSequenceRun()}
        />
      </div>
    );
  }

  return (
    <SequenceRunDetailsContext.Provider
      value={{
        sequenceRunData,
        isLoadingSequenceRun,
        sequenceRunCommentsData,
        isLoadingSequenceRunComments,
        sequenceRunStatesData,
        isLoadingSequenceRunStates,
        sequenceRunStateValidMapData,
        latestSequenceRun,
        refresh,
      }}
    >
      {children}
    </SequenceRunDetailsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook — throws if used outside the Provider
// ---------------------------------------------------------------------------

export const useSequenceRunDetailsContext = (): SequenceRunDetailsContextValue => {
  const ctx = useContext(SequenceRunDetailsContext);
  if (!ctx) {
    throw new Error(
      'useSequenceRunDetailsContext must be used within a SequenceRunDetailsProvider'
    );
  }
  return ctx;
};
