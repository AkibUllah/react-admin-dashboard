import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

/** Route guard: unauthenticated users are sent to /login and returned afterwards. */
export function RequireAuth() {
  const location = useLocation();
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
