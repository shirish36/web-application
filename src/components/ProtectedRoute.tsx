import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return <div className="loading">Redirecting to login...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
