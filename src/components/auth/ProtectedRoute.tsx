import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthContext } from '@/context/auth-context';
import { useLastVisitedPage } from '@/hooks/useLastVisitedPage';
import { isRestorablePath } from '@/utils/last-visited-page';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  const [, setLastVisitedPage] = useLastVisitedPage();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  // When an unauthenticated user lands on a protected URL (deep link or a
  // cross-environment redirect), remember the intended page before bouncing
  // to sign-in so it can be restored after login.
  useEffect(() => {
    if (!isAuthenticated && isRestorablePath(fullPath)) {
      setLastVisitedPage(fullPath);
    }
  }, [isAuthenticated, fullPath, setLastVisitedPage]);

  if (!isAuthenticated) {
    return <Navigate to='/auth/signin' replace />;
  }

  return <Outlet />;
}
