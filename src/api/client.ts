import axios, {
 type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
  timeout: 15000,
});

/* --------------------------------------------------------
 * REQUEST INTERCEPTOR
 * ------------------------------------------------------*/
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------------------------------------
 * RESPONSE INTERCEPTOR
 * ------------------------------------------------------*/
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    /**
     * No response received
     * Backend down, network error, timeout, CORS, etc.
     */
    if (!error.response) {
      toast.error(
        "Unable to connect to the server. Please try again later."
      );

      return Promise.reject(error);
    }

    const status = error.response.status;

    /**
     * Don't try refreshing the refresh endpoint itself.
     */
    if (originalRequest?.url?.includes("/auth/refresh")) {
      useAuthStore.getState().clearAuth();
      window.location.replace("/login");

      return Promise.reject(error);
    }

    /**
     * Access token expired
     */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/auth/refresh");

        const { accessToken, user } = data;

        useAuthStore.getState().setAuth(accessToken, user);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();

        window.location.replace("/login");

        return Promise.reject(refreshError);
      }
    }

    /**
     * Forbidden
     */
    if (status === 403) {
      toast.error("Access denied.");
    }

    /**
     * Validation error
     */
    if (status === 400) {
      toast.error(
        (error.response.data as any)?.message ??
          "Invalid request."
      );
    }

    /**
     * Not Found
     */
    if (status === 404) {
      toast.error("Requested resource not found.");
    }

    /**
     * Too Many Requests
     */
    if (status === 429) {
      toast.error(
        "Too many requests. Please try again shortly."
      );
    }

    /**
     * Server Error
     */
    if (status >= 500) {
      toast.error(
        "Server error. Please try again later."
      );
    }

    return Promise.reject(error);
  }
);

export default api;