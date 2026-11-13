import { create } from "zustand";
import type { UserRole } from "../types";

/**
 * Transient role override for pre-auth screens. On the login page a guest
 * picks a role before signing in; the ThemeProvider reads this so the entire
 * auth surface previews that role's REAL dual-color preset (instead of the
 * signed-in user's role or the Admin default). Cleared on unmount.
 */
interface ThemePreviewState {
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
}

export const useThemeStore = create<ThemePreviewState>((set) => ({
  previewRole: null,
  setPreviewRole: (role) => set({ previewRole: role }),
}));