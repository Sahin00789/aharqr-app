import type { AuthSession } from "../types";
import { getDeviceId } from "../lib/device";
import { getDeviceInfo } from "../utils/device.util";
import { useAuthStore } from "../stores/auth-store";
import { getGuestSessionCookie } from "../utils/guest-session.util";
import { expireSession } from "../lib/session";
import {
  NETWORK_MESSAGE,
  OFFLINE_MESSAGE,
  messageForStatus,
} from "../utils/api-error-messages";

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

let refreshInFlight: Promise<RefreshOutcome> | null = null;

/**
 * - `refreshed`   — new access token stored, safe to replay the request.
 * - `rejected`    — the server said the refresh token is invalid/revoked.
 * - `unreachable` — timeout / offline / 5xx: the session may still be valid.
 */
type RefreshOutcome = "refreshed" | "rejected" | "unreachable";

/** Runs a fetch, converting transport failures into a readable ApiError. */
async function fetchWithNetworkGuard(send: () => Promise<Response>): Promise<Response> {
  try {
    return await send();
  } catch (error) {
    // Let React Query abort handling work unchanged.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    const offline =
      typeof navigator !== "undefined" && navigator.onLine === false;
    throw new ApiError(
      0,
      offline ? "OFFLINE" : "NETWORK_ERROR",
      offline ? OFFLINE_MESSAGE : NETWORK_MESSAGE,
    );
  }
}

/**
 * Browser refresh relies on the httpOnly cookie the backend sets on
 * /api/auth/*; same-origin via the Vite proxy so it just works.
 * The response body also carries a refresh token for mobile clients —
 * intentionally ignored here.
 */
async function tryRefresh(): Promise<RefreshOutcome> {
  if (!refreshInFlight) {
    refreshInFlight = (async (): Promise<RefreshOutcome> => {
      // Never let a hanging refresh block the app on "Restoring session…".
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
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
          signal: controller.signal,
        });
        // Only an auth rejection means the session is truly over.
        if (res.status === 401 || res.status === 403) return "rejected";
        if (!res.ok) return "unreachable";
        const session = (await res.json()) as AuthSession;
        useAuthStore.getState().setSession(session.user, session.accessToken);
        return "refreshed";
      } catch {
        return "unreachable";
      } finally {
        clearTimeout(timeout);
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

  let res = await fetchWithNetworkGuard(send);

  // Access token expired: refresh once, replay the original request with the
  // newly issued token. If the refresh token is rejected too, the session is
  // unusable — end it so the route guards send the user back to /auth.
  // A network failure ("unreachable") keeps the session intact: the user may
  // simply be offline, and signing them out would be wrong.
  let refreshOutcome: RefreshOutcome | null = null;
  if (res.status === 401 && auth && !path.startsWith("/api/auth/refresh")) {
    refreshOutcome = await tryRefresh();
    if (refreshOutcome === "refreshed") {
      res = await fetchWithNetworkGuard(send);
    } else if (refreshOutcome === "rejected") {
      expireSession();
    }
  }

  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string; message?: string; details?: unknown })
    | null;

  if (!res.ok) {
    // Still unauthorized with a freshly issued token (or after a definitive
    // refresh rejection): the session is gone, not just stale. Offline /
    // 5xx refresh failures deliberately do not reach this branch.
    if (
      res.status === 401 &&
      auth &&
      (refreshOutcome === "refreshed" || refreshOutcome === "rejected")
    ) {
      expireSession();
    }
    const serverMessage =
      typeof data?.message === "string" && data.message.trim()
        ? data.message
        : typeof data?.error === "string" && data.error.trim()
          ? data.error
          : undefined;
    throw new ApiError(
      res.status,
      data?.error ?? "REQUEST_FAILED",
      serverMessage ?? messageForStatus(res.status),
      data?.details,
    );
  }

  return data as T;
}
