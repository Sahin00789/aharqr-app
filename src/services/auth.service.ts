import type { AuthSession, GoogleProfile } from "../types";
import { api } from "./api-client";
import { useAuthStore } from "../stores/auth-store";

/**
 * Login for any role using a Google ID token (credential) obtained from
 * @react-oauth/google. The backend verifies the token and issues a session.
 */
export async function loginWithGoogle(credential: string): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/v1/auth/google/login", {
    method: "POST",
    auth: false,
    body: { credential },
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/** Email + password login — available to every role. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/v1/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/**
 * Signup stage 1: prove a Google identity and get a short-lived
 * registration ticket for creating a restaurant admin account.
 */
export async function verifyGoogleCode(credential: string): Promise<{
  profile: GoogleProfile;
  registrationTicket: string;
}> {
  return api("/api/v1/auth/google/verify", {
    method: "POST",
    auth: false,
    body: { credential },
  });
}

/** Stage 2 of admin signup — stores the returned session on success. */
export async function registerRestaurantAdmin(input: {
  registrationTicket: string;
  restaurantName: string;
  phone?: string;
  address?: string;
}): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/v1/auth/google/register", {
    method: "POST",
    auth: false,
    body: input,
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

export function logout(): Promise<void> {
  return api("/api/v1/auth/logout", { method: "POST" });
}
