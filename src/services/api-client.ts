import type { AuthSession } from "../types";
import { getDeviceId } from "../lib/device";
import { getDeviceInfo } from "../utils/device.util";
import { useAuthStore } from "../stores/auth-store";
import { getGuestSessionCookie } from "../utils/guest-session.util";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach bearer token + attempt refresh on 401 (default true). */
  auth?: boolean;
  signal?: AbortSignal;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Browser refresh relies on the httpOnly cookie the backend sets on
 * /api/auth/*; same-origin via the Vite proxy so it just works.
 * The response body also carries a refresh token for mobile clients —
 * intentionally ignored here.
 */
async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const device = getDeviceInfo();
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: {
            "x-device-id": getDeviceId(),
            "x-device-fingerprint": device.fingerprint,
            "content-type": "application/json",
          },
          body: "{}",
        });
        if (!res.ok) return false;
        const session = (await res.json()) as AuthSession;
        useAuthStore.getState().setSession(session.user, session.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Called once on app boot: silently restores the session if possible. */
export async function bootstrapSession(): Promise<void> {
  await tryRefresh();
  useAuthStore.getState().markBooted();
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  // Build headers on every attempt so a refreshed token is picked up on replay.
  const send = () => {
    const token = auth ? useAuthStore.getState().accessToken : undefined;
    const guestToken = getGuestSessionCookie();
    const device = getDeviceInfo();
    const headers: Record<string, string> = {
      "x-device-id": getDeviceId(),
      "x-device-fingerprint": device.fingerprint,
    };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (token) headers.authorization = `Bearer ${token}`;
    if (guestToken) headers["x-session-token"] = guestToken;

    return fetch(path, {
      method,
      headers,
      credentials: "include",
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let res = await send();

  // Access token expired: refresh once, replay the original request with the
  // newly issued token.
  if (res.status === 401 && auth && !path.startsWith("/api/auth/")) {
    if (await tryRefresh()) {
      res = await send();
    }
  }

  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string; message?: string; details?: unknown })
    | null;

  if (!res.ok) {
    if (path.startsWith("/api/auth/") && res.status === 401) {
      useAuthStore.getState().clearSession();
    }
    throw new ApiError(
      res.status,
      data?.error ?? "REQUEST_FAILED",
      data?.message ?? data?.error ?? `Request failed (${res.status})`,
      data?.details,
    );
  }

  return data as T;
}
