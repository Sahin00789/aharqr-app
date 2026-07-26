import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore, type AppRole } from "../store/authStore";
import { api } from "../api/client";

interface ProtectedRouteProps {
  publicOnly?: boolean;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({
  publicOnly = false,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user, setAuth, setInitialized, clearAuth } = useAuthStore();
  const location = useLocation();

  // Step 1: Application Starts -> POST /auth/refresh -> GET /auth/me -> Store User in Zustand
  useEffect(() => {
    if (!isInitialized) {
      api.post("/auth/refresh")
        .then(({ data }) => {
          if (data.success && data.accessToken && data.user) {
            setAuth(data.accessToken, data.user);
          } else {
            // Try fetching GET /auth/me if access token exists
            api.get("/auth/me")
              .then((meRes) => {
                if (meRes.data.success && meRes.data.user) {
                  setAuth(data.accessToken, meRes.data.user);
                } else {
                  setInitialized(true);
                }
              })
              .catch(() => setInitialized(true));
          }
        })
        .catch(() => {
          clearAuth();
          setInitialized(true);
        });
    }
  }, [isInitialized, setAuth, setInitialized, clearAuth]);

  // Render Loader ONLY while checking initial refresh token cookie
  if (!isInitialized) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200 font-sans">
        <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 shadow-xl">
          <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
        </div>
        <p className="text-xs font-extrabold text-white tracking-wide">AharQR OS</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Initializing session...</p>
      </div>
    );
  }

  // Public routes (/login, /register)
  if (publicOnly) {
    if (!isAuthenticated) {
      return <Outlet />;
    }

    switch (user?.role) {
      case "PLATFORM_ADMIN":
      case "RESTAURANT_ADMIN":
        return (
          <Navigate
            to={user.restaurantId || user.role === "PLATFORM_ADMIN" ? "/admin/dashboard" : "/onboarding"}
            replace
          />
        );

      case "CAPTAIN":
        return <Navigate to="/captain/tables" replace />;

      case "CHEF":
        return <Navigate to="/chef/kds" replace />;

      case "CUSTOMER":
        return <Navigate to="/" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  // Authentication check for protected routes
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Role authorization check
  if (
    allowedRoles &&
    (!user?.role || !allowedRoles.includes(user.role as AppRole))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Restaurant onboarding check
  if (user?.role === "RESTAURANT_ADMIN") {
    const isOnboarding = location.pathname.startsWith("/onboarding");

    if (!user.restaurantId && !isOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }

    if (user.restaurantId && isOnboarding) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
}