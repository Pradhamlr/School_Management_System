import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if user is trying to access wrong dashboard
    if (isAuthenticated && user) {
      const currentPath = location.pathname;
      const userRole = user.role.toLowerCase();
      
      if (currentPath.includes('admin') && userRole !== 'admin') {
        window.location.href = `/${userRole}-dashboard`;
      } else if (currentPath.includes('teacher') && userRole !== 'teacher') {
        window.location.href = `/${userRole}-dashboard`;
      } else if (currentPath.includes('student') && userRole !== 'student') {
        window.location.href = `/${userRole}-dashboard`;
      }
    }
  }, [isAuthenticated, user, location]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;