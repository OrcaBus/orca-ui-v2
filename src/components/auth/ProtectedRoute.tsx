import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthContext } from '@/context/auth-context';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/auth/signin' replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
