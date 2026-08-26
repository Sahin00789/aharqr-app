import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { ROLE_PATHS, type UserRole } from "../types";
import { useAuthStore } from "../stores/auth-store";
import { PageLoader } from "./ui";

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
