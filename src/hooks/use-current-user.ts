import { useAuthStore } from "../stores/auth-store";

/** Current signed-in user, handy for role-aware screen copy. */
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}