import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { connectNotificationSocket } from "./notificationSocket";

/**
 * Keeps a live WebSocket connection to the restaurant's webhook rooms while a
 * session is active, routing broadcast events into the local notification store.
 * Mount once near the app root (inside the router) so it covers every workspace.
 */
export function NotificationSocketProvider({ children }: { children: ReactNode }) {
  const restaurantId = useAuthStore((s) => s.user?.restaurantId);

  useEffect(() => {
    if (!restaurantId) return;
    const disconnect = connectNotificationSocket(restaurantId);
    return disconnect;
  }, [restaurantId]);

  return <>{children}</>;
}
