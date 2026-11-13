import { create } from "zustand";

/** Persisted QR guest dining session context (mirrors the backend session view). */
export interface GuestSession {
  token: string;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string | null;
  shortAddress: string | null;
  tableId: string;
  tableNumber: string;
}

interface GuestSessionState {
  session: GuestSession | null;
  setSession: (session: GuestSession) => void;
  clearSession: () => void;
}

/** In-memory guest session for the current QR visit (durable id lives in a cookie). */
export const useGuestSessionStore = create<GuestSessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
