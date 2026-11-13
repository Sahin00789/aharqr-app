import { useEffect, useLayoutEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/auth-store";
import { useGuestSessionStore } from "../../workspace/customer/guest-session-store";
import { useNotificationStore } from "./notificationStore";
import {
  connectNotificationSocket,
  subscribeNotificationEvents,
} from "./notificationSocket";

/**
 * Keeps authenticated order-sync and private user-activity sockets while a staff
 * session is active. Mount once inside the router to cover every workspace.
 */
export function NotificationSocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const guestSession = useGuestSessionStore((s) => s.session);
  const setNotificationScope = useNotificationStore((s) => s.setScope);
  const restaurantId = user?.restaurantId;

  useLayoutEffect(() => {
    const scope = user
      ? `staff:${user.role}:${user.id}`
      : guestSession
        ? `guest:${guestSession.token}`
        : null;
    setNotificationScope(scope);
  }, [guestSession, setNotificationScope, user]);

  useEffect(() => {
    if (!restaurantId || !accessToken || !user) return;
    const disconnect = connectNotificationSocket(restaurantId, accessToken);
    return disconnect;
  }, [accessToken, restaurantId, user]);

  useEffect(() => {
    return subscribeNotificationEvents((ev) => {
      if (ev.event !== "USER_ACTIVITY" || !ev.title) return;
      const message = [ev.title, ev.body].filter(Boolean).join(" — ");
      const options = {
        duration: 5000,
        position: "top-right" as const,
        ariaProps: { role: "status" as const, "aria-live": "polite" as const },
      };
      if (ev.severity === "error") toast.error(message, options);
    });
  }, []);

  return <>{children}</>;
}
