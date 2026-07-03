import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  // MUST be true to ensure the HttpOnly refresh token cookie is sent to the backend
  withCredentials: true, 
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Grab the latest access token from Zustand memory
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the server returns a 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to hit your backend refresh endpoint. 
        // The browser automatically attaches the HttpOnly refreshToken cookie here.
        const response = await axios.post(
          'http://localhost:3000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = response.data;

        // 1. Update Zustand with the fresh credentials
        useAuthStore.getState().setAuth(accessToken, user);

        // 2. Update the failed request's header with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 3. Resend the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token is expired or invalid, wipe the session
        useAuthStore.getState().clearAuth();
        
        // Hard redirect to login to protect the app state
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);