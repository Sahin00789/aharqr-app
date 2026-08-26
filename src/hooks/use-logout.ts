import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { logout } from "../services/auth.service";
import { useAuthStore } from "../stores/auth-store";

export function useLogout() {
  const navigate = useNavigate();
  return async function logoutAndRedirect() {
    try {
      await logout();
    } catch {
      // best effort — clear locally regardless
    }
    useAuthStore.getState().clearSession();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };
}
