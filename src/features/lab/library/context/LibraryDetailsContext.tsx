/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, useCallback, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import {
  useQueryMetadataDetailLibraryModel,
  type LibraryDetailType,
} from '../../shared/api/lab.api';
import { useParams } from 'react-router';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LibraryDetailsContextType {
  libraryDetail: LibraryDetailType;
  isLoadingLibraryDetail: boolean;
  isErrorLibraryDetail: boolean;
  refetchLibraryDetail: () => void;
}

// ---------------------------------------------------------------------------
// Context — undefined default forces consumers to be wrapped in the Provider
// ---------------------------------------------------------------------------

const LibraryDetailsContext = createContext<LibraryDetailsContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const LibraryDetailsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { libraryOrcabusId } = useParams<{ libraryOrcabusId: string }>();

  const {
    data: libraryDetail,
    isLoading: isLoadingLibraryDetail,
    isError: isErrorLibraryDetail,
    error: libraryDetailError,
    refetch,
  } = useQueryMetadataDetailLibraryModel({
    params: {
      path: {
        orcabusId: libraryOrcabusId ?? '',
      },
    },
    reactQuery: { enabled: !!libraryOrcabusId },
  });

  const refetchLibraryDetail = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Block render only during the very first load of the core library data.
  if (isLoadingLibraryDetail) {
    return (
      <div className='h-screen'>
        <SpinnerWithText text='Loading...' />
      </div>
    );
  }

  if (isErrorLibraryDetail || !libraryDetail) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to load library details'
          message={
            !isErrorLibraryDetail ? 'The requested library details could not be loaded.' : undefined
          }
          error={libraryDetailError}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <LibraryDetailsContext.Provider
      value={{ libraryDetail, isLoadingLibraryDetail, isErrorLibraryDetail, refetchLibraryDetail }}
    >
      {children}
    </LibraryDetailsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook — throws if used outside the Provider
// ---------------------------------------------------------------------------

export const useLibraryDetails = (): LibraryDetailsContextType => {
  const ctx = useContext(LibraryDetailsContext);
  if (!ctx) {
    throw new Error('useLibraryDetails must be used within a LibraryDetailsProvider');
  }
  return ctx;
};
