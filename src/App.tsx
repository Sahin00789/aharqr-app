import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import { bootstrapSession } from "./services/api-client";
import { useAuthStore } from "./stores/auth-store";
import { ROLE_PATHS, type UserRole } from "./types";
import { PageLoader } from "./common/components";

import LandingPage from "./common/pages/publicpage/LandingPage";
import AboutPage from "./common/pages/publicpage/AboutPage";
import HelpPage from "./common/pages/publicpage/HelpPage";
import { LoginPage } from "./common/pages/auth/LoginPage";
import { SignupPage } from "./common/pages/auth/SignupPage";
import NotFound from "./common/pages/errors/NotFound";
import Unauthorized from "./common/pages/errors/Unauthorized";

import { adminRoutes } from "./workspace/admin/routes";
import { captainRoutes } from "./workspace/captain/routes";
import { chefRoutes } from "./workspace/chef/routes";
import { customerRoutes } from "./workspace/customer/routes";
import { NotificationSocketProvider } from "./common/notifications/NotificationSocketProvider";
import { ThemeProvider } from "./common/theme";

/** Renders children only when a session exists; otherwise bounces to /auth. */
export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const booted = useAuthStore((s) => s.booted);
  const location = useLocation();

  if (!booted) return <PageLoader label="Restoring session…" />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Keeps each workspace role-scoped — no peeking across roles via URL. */
export function RequireRole({ role, children }: { role: UserRole; children?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const booted = useAuthStore((s) => s.booted);
  if (!booted) return <PageLoader label="Restoring session…" />;
  if (user?.role !== role) {
    const target = user ? `/app/${ROLE_PATHS[user.role]}` : "/auth";
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}

/** Sends an authenticated user to their own workspace root. */
export function NavigateToMyWorkspace() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={`/app/${ROLE_PATHS[user.role]}`} replace />;
}

/** Auth pages: an already-signed-in visitor is sent to their workspace. */
function PublicOnly() {
  const user = useAuthStore((s) => s.user);
  const booted = useAuthStore((s) => s.booted);
  if (booted && user) return <NavigateToMyWorkspace />;
  return <Outlet />;
}

export default function App() {
  useEffect(() => {
    void bootstrapSession();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationSocketProvider>
          {/* Every `toast.*` call in the app renders here. Surface colours come
              from CSS vars so the feed follows light/dark mode. */}
          <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ top: 16, right: 16 }}
            toastOptions={{
              duration: 4000,
              className: "aharqr-toast",
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-fg)",
                border: "1px solid var(--toast-border)",
                boxShadow: "var(--toast-shadow)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                lineHeight: "1.35",
                maxWidth: "420px",
              },
              success: {
                iconTheme: {
                  primary: "var(--accent-600)",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
              },
              loading: {
                iconTheme: {
                  primary: "var(--accent-600)",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Public auth screens */}
            <Route element={<PublicOnly />}>
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Authenticated staff workspaces, mounted under /app/<role>.
                RequireAuth is the outer gate: it holds the boot loader while
                the refresh cookie is being exchanged, and bounces to /auth the
                moment the session ends (sign-out or rejected refresh token). */}
            <Route path="/app" element={<RequireAuth />}>
              <Route index element={<NavigateToMyWorkspace />} />
              {adminRoutes}
              {captainRoutes}
              {chefRoutes}
            </Route>

            {/* Public QR guest flow */}
            {customerRoutes}

            {/* Error fallbacks */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationSocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
