import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/auth-store";
import { getDeviceInfo } from "../utils/device.util";
import { getDeviceId } from "../lib/device";
import { expireSession } from "../lib/session";
import {
  NETWORK_MESSAGE,
  OFFLINE_MESSAGE,
  messageForStatus,
} from "../utils/api-error-messages";

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
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    config.headers["X-Device-Id"] = getDeviceId();
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
      const offline =
        typeof navigator !== "undefined" && navigator.onLine === false;
      toast.error(offline ? OFFLINE_MESSAGE : NETWORK_MESSAGE);
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
        url.includes("/auth/otp") ||
        url.includes("/auth/register") ||
        url.includes("/auth/customer/qr-login") ||
        url.includes("/auth/refresh");

      // Do NOT trigger refresh logic for auth endpoints (login, google, register, refresh itself)
      if (isAuthActionEndpoint) {
        if (url.includes("/auth/refresh")) {
          useAuthStore.getState().markBooted();
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
            reject: (err: unknown) => {
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
                 useAuthStore.getState().setSession(user, accessToken);
                 originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                 processQueue(null, accessToken);
                 resolve(api(originalRequest));
               } else {
                 throw new Error("Invalid token refresh response.");
               }
             })
             .catch((refreshErr: unknown) => {
               processQueue(refreshErr, null);
               // Only a definitive auth rejection ends the session; a network
               // blip or 5xx must not sign the user out.
               const refreshStatus = (
                 refreshErr as { response?: { status?: number } } | undefined
               )?.response?.status;
               if (refreshStatus === 401 || refreshStatus === 403) {
                 expireSession();
               }
               reject(refreshErr);
             })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
    }

    /**
     * Still unauthorized after a refresh + replay: the session is unusable.
     * (`isAuthActionEndpoint` returned earlier, so login/OTP 401s never end up
     * here and never show a "session expired" notice.)
     */
    if (status === 401) {
      expireSession();
    }

    const data = (error.response?.data as
      | { message?: string; error?: string }
      | undefined);
    const serverMessage = data?.message ?? data?.error;

    /**
     * Forbidden
     */
    if (status === 403) {
      toast.error(serverMessage || messageForStatus(403));
    }

    /**
     * Validation error
     */
    if (status === 400 || status === 422) {
      toast.error(serverMessage || messageForStatus(status));
    }

    /**
     * Not Found
     */
    if (status === 404) {
      toast.error(serverMessage || messageForStatus(404));
    }

    /**
     * Too Many Requests
     */
    if (status === 429) {
      toast.error(serverMessage || messageForStatus(429));
    }

    /**
     * Server Error (500 / 502 / 503 / 504 …)
     */
    if (status >= 500) {
      toast.error(serverMessage || messageForStatus(status));
    }

    return Promise.reject(error);
  }
);

export default api;