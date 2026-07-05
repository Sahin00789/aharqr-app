import { useAuthStore } from "../store/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RestaurantSetupRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Only Restaurant Admin needs onboarding
  if (user?.role !== "RESTAURANT_ADMIN") {
    return <Outlet />;
  }

  const isOnboarding = location.pathname.startsWith("/onboarding");

  // No restaurant yet
  if (!user.restaurantId && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Already created
  if (user.restaurantId && isOnboarding) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}