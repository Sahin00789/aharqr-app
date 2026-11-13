import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { logout } from "../services/auth.service";
import { useAuthStore } from "../stores/auth-store";
import { resetClientSessionData } from "../lib/session";

export function useLogout() {
  const navigate = useNavigate();
  return async function logoutAndRedirect() {
    try {
      await logout();
    } catch {
      // best effort — clear locally regardless
    }
    useAuthStore.getState().clearSession();
    // Drop the previous account's cached queries and notification feed so the
    // next sign-in never sees stale tenant data.
    resetClientSessionData();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };
}
