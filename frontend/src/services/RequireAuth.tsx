
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to={`/auth?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};