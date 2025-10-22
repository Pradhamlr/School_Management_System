import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login/student" replace />;
  }

  if (requiredRole && user?.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/login/student" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;