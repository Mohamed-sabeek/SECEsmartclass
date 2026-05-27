import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Prevent back button navigation after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!isAuthenticated) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] animate-pulse">
        <div className="space-y-6 flex flex-col items-center w-full max-w-sm px-6">
          <div className="w-24 h-24 bg-gray-300/30 rounded-[2rem]"></div>
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="h-6 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch - redirect to login
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // Authorized - render the protected component
  return children;
};

export default ProtectedRoute;
