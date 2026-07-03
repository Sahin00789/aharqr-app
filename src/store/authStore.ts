import { create } from 'zustand';

interface User {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
  restaurantId?: string | null; // <-- Add this line
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Used to prevent UI flashing during initial app load
  
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setInitialized: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (accessToken, user) => 
    set({ accessToken, user, isAuthenticated: true }),
    
  clearAuth: () => 
    set({ accessToken: null, user: null, isAuthenticated: false }),
    
  setInitialized: (status) => 
    set({ isInitialized: status }),
}));