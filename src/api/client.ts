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
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  timeout: 15000,
});

/* --------------------------------------------------------
 * MUTEX QUEUE FOR CONCURRENT REFRESH CALLS
 * ------------------------------------------------------*/
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

import { getDeviceInfo } from "../utils/device.util";

/* --------------------------------------------------------
 * REQUEST INTERCEPTOR
 * ------------------------------------------------------*/
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const device = getDeviceInfo();
    config.headers["X-Device-Fingerprint"] = device.fingerprint;
    config.headers["X-Device-Name"] = device.deviceName;
    config.headers["X-Device-Platform"] = device.platform;
    config.headers["X-Device-Browser"] = device.browser;

    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------------------------------------
 * RESPONSE INTERCEPTOR WITH THREAD-SAFE TOKEN REFRESH
 * ------------------------------------------------------*/
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    /**
     * No response received (Network failure / server down)
     */
    if (!error.response) {
      toast.error(
        "Unable to connect to the server. Please try again later."
      );
      return Promise.reject(error);
    }

    const status = error.response.status;

    /**
     * Handle 401 Unauthorized & Token Expiry Refresh Logic
     */
    if (status === 401 && originalRequest) {
      const url = originalRequest.url ?? "";
      const isAuthActionEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/google") ||
        url.includes("/auth/register") ||
        url.includes("/auth/customer/qr-login") ||
        url.includes("/auth/refresh");

      // Do NOT trigger refresh logic for auth endpoints (login, google, register, refresh itself)
      if (isAuthActionEndpoint) {
        if (url.includes("/auth/refresh")) {
          useAuthStore.getState().setInitialized(true);
        }
        return Promise.reject(error);
      }

      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      // First request to encounter 401 triggers token re-issuance
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          api.post("/auth/refresh")
            .then(({ data }) => {
              if (data.success && data.accessToken) {
                const { accessToken, user } = data;
                useAuthStore.getState().setAuth(accessToken, user);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                resolve(api(originalRequest));
              } else {
                throw new Error("Invalid token refresh response.");
              }
            })
            .catch((refreshErr) => {
              processQueue(refreshErr, null);
              useAuthStore.getState().clearAuth();
              reject(refreshErr);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
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