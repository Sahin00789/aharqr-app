import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Protects internal pages.
 * Kicks unauthenticated users back to the login page.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Pass the attempted location in state so we can redirect them back after they log in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected component
  return <Outlet />;
}

/**
 * Protects auth pages (e.g., /login, /register).
 * Prevents logged-in users from seeing the auth screens again.
 */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated) {
    // Optional: You can route them dynamically based on their role if they accidentally hit /login
    if (user?.role === 'RESTAURANT_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'CAPTAIN') return <Navigate to="/captain/tables" replace />;
    if (user?.role === 'CHEF') return <Navigate to="/chef/kds" replace />;
    
    // Default fallback
    return <Navigate to="/" replace />;
  }

  // Render the public component (Login/Register)
  return <Outlet />;
}