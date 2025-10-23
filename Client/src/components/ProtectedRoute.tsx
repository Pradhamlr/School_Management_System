import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, initialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect users away from areas that don't match their role (prevents a student/teacher from opening admin pages)
  useEffect(() => {
    if (!initialized || !isAuthenticated || !user) return;

    const userRole = (user.role || '').toLowerCase();
    const segments = location.pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] || '';

    // Map possible first segments to roles: e.g. '/admin/...' -> 'admin'
    if (firstSegment && firstSegment !== userRole) {
      // Avoid redirect loops by only redirecting when the path clearly belongs to another role
      if (['admin', 'teacher', 'student'].includes(firstSegment)) {
        navigate(`/${userRole}`, { replace: true });
      }
    }
  }, [initialized, isAuthenticated, user, location.pathname, navigate]);

  // Wait for auth initialization to avoid flashing redirects
  if (!initialized) return null;

  if (!isAuthenticated) return <Navigate to="/login/student" replace />;

  if (requiredRole && user?.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/login/student" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;