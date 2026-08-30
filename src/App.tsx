import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { bootstrapSession } from "./services/api-client";
import { useAuthStore } from "./stores/auth-store";
import { NavigateToMyWorkspace } from "./common/guards";

import { Home } from "./common/Home";
import { LoginPage } from "./auth/LoginPage";
import { SignupPage } from "./auth/SignupPage";
import NotFound from "./common/errors/NotFound";
import Unauthorized from "./common/errors/Unauthorized";

import { adminRoutes } from "./workspace/admin/routes";
import { captainRoutes } from "./workspace/captain/routes";
import { chefRoutes } from "./workspace/chef/routes";
import { observerRoutes } from "./workspace/observer/routes";
import { customerRoutes } from "./workspace/customer/routes";
import { NotificationSocketProvider } from "./common/notifications/NotificationSocketProvider";
import { ThemeProvider } from "./common/theme";

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
          <Routes>
          {/* Public landing */}
          <Route path="/" element={<Home />} />

        {/* Public auth screens */}
        <Route element={<PublicOnly />}>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Authenticated staff workspaces, mounted under /app/<role> */}
        <Route path="/app">
          <Route index element={<NavigateToMyWorkspace />} />
          {adminRoutes}
          {captainRoutes}
          {chefRoutes}
          {observerRoutes}
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
