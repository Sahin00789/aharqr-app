import type { AuthSession, GoogleProfile, PublicUser } from "../types";
import { api } from "./api-client";
import { useAuthStore } from "../stores/auth-store";

/**
 * Login for any role using a Google OAuth authorization code obtained from
 * the GIS popup flow. The backend swaps the code for tokens server-side
 * (`postmessage`) and issues a session.
 */
export async function loginWithGoogle(code: string): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/auth/login/google", {
    method: "POST",
    auth: false,
    body: { code, origin: window.location.origin },
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/** Roles that can sign in with an emailed one-time code. */
export type OtpRole = "RESTAURANT_ADMIN" | "CAPTAIN" | "CHEF";

export interface OtpRequestResult {
  email: string;
  role: OtpRole;
  expiresInSeconds: number;
  delivered: boolean;
  /** Present only in development — the backend returns the code when SMTP is off. */
  devOtp?: string;
  message?: string;
}

/**
 * Email OTP login — stage 1: request a 6-digit code.
 * The account must already exist for the selected role.
 */
export function requestLoginOtp(
  email: string,
  role: OtpRole,
): Promise<OtpRequestResult> {
  return api<OtpRequestResult>("/api/auth/otp/request", {
    method: "POST",
    auth: false,
    body: { email, role },
  });
}

/**
 * Email OTP login — stage 2: exchange the code for a session.
 * The returned session is stored in the auth store just like Google login.
 */
export async function verifyLoginOtp(
  email: string,
  role: OtpRole,
  otp: string,
): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/auth/otp/verify", {
    method: "POST",
    auth: false,
    body: { email, role, otp },
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/**
 * Signup stage 1: prove a Google identity and get a short-lived
 * registration ticket for creating a restaurant admin account.
 */
export async function verifyGoogleCode(code: string): Promise<{
  profile: GoogleProfile;
  registrationTicket: string;
  alreadyExists: boolean;
}> {
  const data = await api<{
    profile: GoogleProfile;
    googleProfileToken: string;
    alreadyExists: boolean;
  }>("/api/auth/verify-google-profile", {
    method: "POST",
    auth: false,
    body: { code, origin: window.location.origin },
  });
  return {
    profile: data.profile,
    registrationTicket: data.googleProfileToken,
    alreadyExists: data.alreadyExists,
  };
}

/** Stage 2 of admin signup — stores the returned session on success. */
export async function registerRestaurantAdmin(input: {
  googleProfileToken: string;
  restaurant: {
    name: string;
    phone: string;
    state: string;
    district: string;
    blockMunicipality: string;
    townCity: string;
    villageWard: string;
    locality: string;
    street?: string;
    landmark?: string;
    premisesName: string;
    postalCode: string;
    areaType?: "RURAL" | "URBAN";
  };
}): Promise<AuthSession> {
  const session = await api<AuthSession>("/api/auth/register/admin/full", {
    method: "POST",
    auth: false,
    body: input,
  });
  useAuthStore.getState().setSession(session.user, session.accessToken);
  return session;
}

/** Fetch the signed-in user's profile (phone/gender/dob/picture) from the backend DB. */
export function fetchMyProfile(): Promise<PublicUser> {
  return api<{ success: boolean; user: PublicUser }>("/api/auth/me").then(
    (data) => data.user,
  );
}

/** Self-service: update the signed-in user's own profile. Email is read-only. */
export function updateMyProfile(input: {
  firstName: string;
  lastName?: string;
  phone?: string;
  /** Only sent when a new photo was chosen (base64 data URL). */
  picture?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  /** ISO date YYYY-MM-DD */
  dob?: string;
}): Promise<PublicUser> {
  return api<{ success: boolean; user: PublicUser }>("/api/auth/me", {
    method: "PATCH",
    body: input,
  }).then((data) => data.user);
}

export function logout(): Promise<void> {
  return api("/api/auth/logout", { method: "POST" });
}
