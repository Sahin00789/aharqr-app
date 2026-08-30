import type { AuthSession, GoogleProfile, PublicUser } from "../types";
import { api } from "./api-client";
import { useAuthStore } from "../stores/auth-store";

/**
 * Login for any role using a Google ID token (credential) obtained from
 * @react-oauth/google. The backend verifies the token and issues a session.
 */
export async function loginWithGoogle(credential: string): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/auth/login/google", {
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
  const session = await api<AuthSession>("/api/auth/login", {
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
  return api("/api/auth/verify-google-profile", {
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
  const session = await api<AuthSession>("/api/auth/register/admin/full", {
    method: "POST",
    auth: false,
    body: input,
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/** Self-service: update the signed-in user's own profile. */
export function updateMyProfile(input: {
  firstName: string;
  lastName?: string;
  phone?: string;
}): Promise<PublicUser> {
  return api<{ success: boolean; user: PublicUser }>("/api/auth/me", {
    method: "PATCH",
    body: input,
  }).then((data) => data.user);
}

export function logout(): Promise<void> {
  return api("/api/auth/logout", { method: "POST" });
}
