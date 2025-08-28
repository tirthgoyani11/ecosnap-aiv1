import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Session: {session ? 'Present' : 'None'}</p>
              <p>User: {user ? user.email : 'None'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
