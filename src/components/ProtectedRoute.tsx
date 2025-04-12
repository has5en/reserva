
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string | string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, hasRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles) {
    // Handle both string and array formats
    const roles = Array.isArray(allowedRoles) ? allowedRoles : allowedRoles.split(',');
    
    // Check if user has any of the allowed roles
    const hasAllowedRole = roles.some(role => {
      // Cast the role to UserRole for type safety
      return hasRole(role.trim() as UserRole);
    });
    
    if (!hasAllowedRole) {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
