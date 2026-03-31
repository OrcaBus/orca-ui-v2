import { createContext, useContext } from 'react';
import { LibraryDetailType } from '../api/lab.api';

interface LibrariesDetailsContextType {
  libraryDetail: LibraryDetailType;
  refetchLibraryDetail: () => void;
}

export const LibrariesDetailsContext = createContext<LibrariesDetailsContextType>({
  libraryDetail: {} as LibraryDetailType,
  refetchLibraryDetail: () => {},
});

export const useLibrariesDetails = () => {
  return useContext(LibrariesDetailsContext);
};
