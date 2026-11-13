import toast from "react-hot-toast";
import { useAuthStore } from "../stores/auth-store";
import { useNotificationStore } from "../common/notifications/notificationStore";
import { queryClient } from "./queryClient";

/** Single toast id so concurrent 401s don't stack "session expired" notices. */
const SESSION_EXPIRED_TOAST_ID = "session-expired";

/**
 * Drops every piece of state that belongs to the signed-in user.
 *
 * The auth store is cleared separately (explicit logout vs. expired session),
 * but cached TanStack Query data and the notification feed always belong to
 * the previous account and must not leak into the next sign-in.
 */
export function resetClientSessionData(): void {
  queryClient.clear();
  useNotificationStore.getState().setScope(null);
}

/**
 * Ends the client session after the server rejected both the access token and
 * the refresh token (or the session was revoked from another device).
 *
 * Clearing the store flips every route guard (`RequireAuth` / `RequireRole`)
 * to `<Navigate to="/auth" />`, so the user is sent back to the login screen
 * without a hard reload. `sessionExpired` lets the login screen explain why.
 */
export function expireSession(
  message = "Your session has expired. Please sign in again.",
): void {
  const { user } = useAuthStore.getState();

  // Nothing to expire: the user is not signed in (login page, failed OTP, a
  // boot-time refresh failure with no session yet). Concurrent 401 bursts
  // also stop here because the first call already cleared `user`.
  if (!user) return;

  resetClientSessionData();
  useAuthStore.getState().expireSession();

  toast.error(message, {
    id: SESSION_EXPIRED_TOAST_ID,
    duration: 5000,
  });
}
