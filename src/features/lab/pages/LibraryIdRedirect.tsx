import { useParams, Navigate, Link } from 'react-router-dom';
import { useQueryMetadataLibraryModel } from '../api/lab.api';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

/**
 * Resolves a human-readable library ID (e.g. "L2400001") to the internal orcabusId
 * and redirects to the library details page.
 *
 * External users should link to: /lab/libraries/libid/:libraryId
 * This page fetches the library by libraryId and redirects to /lab/libraries/:orcabusId
 */
export function LibraryIdRedirect() {
  const { libraryId } = useParams<{ libraryId: string }>();

  const { data, isLoading, isError, error, refetch } = useQueryMetadataLibraryModel({
    params: {
      query: {
        page: 1,
        rows_per_page: 2, // 2 is enough — detect duplicates without over-fetching
        libraryId: libraryId ?? undefined,
      },
    },
    reactQuery: {
      enabled: !!libraryId,
    },
  });

  if (!libraryId) {
    return <Navigate to='/lab' replace />;
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <SpinnerWithText text='Resolving library...' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to resolve library'
          error={error}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!data?.results?.length) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400'>
        <p>Library not found for Library ID: {libraryId}</p>
        <Link to='/lab' className='text-blue-600 hover:underline dark:text-blue-400'>
          Back to Lab
        </Link>
      </div>
    );
  }

  const results = data.results;
  const library = results[0];

  if (results.length > 1) {
    console.warn(
      `[LibraryIdRedirect] Multiple libraries found for Library ID: ${libraryId}. Showing first result (orcabusId: ${library?.orcabusId}).`
    );
  }

  const orcabusId = library?.orcabusId;
  if (!orcabusId) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-600 dark:text-gray-400'>
        Invalid library data (missing orcabusId).
      </div>
    );
  }

  return <Navigate to={`/lab/libraries/${orcabusId}`} replace />;
}

export default LibraryIdRedirect;
