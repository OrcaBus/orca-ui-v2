import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLocalStorage } from './useLocalStorage';
import { LAST_VISITED_PAGE_STORAGE_KEY } from '@/utils/storage-keys';

/**
 * Read/write access to the persisted last-visited page (router-relative
 * path + query + hash, without the `/v2/` basename). Returns the standard
 * useLocalStorage tuple `[value, setValue, remove]`.
 */
export function useLastVisitedPage() {
  return useLocalStorage<string | null>(LAST_VISITED_PAGE_STORAGE_KEY, null);
}

/**
 * Continuously persist the current route so it can be restored after a
 * logout → login round-trip. Mount once inside the authenticated shell so
 * only authenticated routes are recorded.
 */
export function useTrackLastVisitedPage(): void {
  const location = useLocation();
  const [, setLastVisitedPage] = useLastVisitedPage();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    setLastVisitedPage(fullPath);
  }, [fullPath, setLastVisitedPage]);
}
