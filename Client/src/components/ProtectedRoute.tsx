import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is trying to access wrong dashboard
    if (isAuthenticated && user) {
      const userRole = user.role.toLowerCase();

      // Use the first path segment (e.g. '/admin/students' -> 'admin') to avoid
      // substring matches (e.g. 'students' includes 'student').
      const segments = location.pathname.split('/').filter(Boolean);
      const firstSegment = segments[0] || '';

      if (firstSegment === 'admin' && userRole !== 'admin') {
        navigate(`/${userRole}-dashboard`, { replace: true });
      } else if (firstSegment === 'teacher' && userRole !== 'teacher') {
        navigate(`/${userRole}-dashboard`, { replace: true });
      } else if (firstSegment === 'student' && userRole !== 'student') {
        navigate(`/${userRole}-dashboard`, { replace: true });
      }
    }
  }, [isAuthenticated, user, location, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;