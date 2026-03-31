import { FC, PropsWithChildren } from 'react';
import { useQueryMetadataDetailLibraryModel } from '../api/lab.api';
import { useParams } from 'react-router-dom';
import { LibrariesDetailsContext } from './libraries-context';

export const LibrariesDetailsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { orcabusId } = useParams<{ orcabusId: string }>();

  const {
    data: libraryDetail,
    isLoading: isLoadingLibraryDetail,
    isError: isErrorLibraryDetail,
    refetch: refetchLibraryDetail,
  } = useQueryMetadataDetailLibraryModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
      },
    },
  });

  if (!libraryDetail) {
    return <div>Library not found</div>;
  }

  if (isErrorLibraryDetail) {
    return <div>Error loading library detail</div>;
  }

  if (isLoadingLibraryDetail) {
    return <div>Loading...</div>;
  }

  return (
    <LibrariesDetailsContext.Provider
      value={{ libraryDetail, refetchLibraryDetail: () => void refetchLibraryDetail() }}
    >
      {children}
    </LibrariesDetailsContext.Provider>
  );
};
