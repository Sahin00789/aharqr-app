import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Updated to match your exact business logic
export type AppRole = "RESTAURANT_ADMIN" | "CAPTAIN" | "CHEF" | "CUSTOMER";

interface RoleProtectedRouteProps {
  allowedRoles: AppRole[]; 
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role exists in the allowedRoles array
  if (user?.role && !allowedRoles.includes(user.role as AppRole)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  return <Outlet />;
}