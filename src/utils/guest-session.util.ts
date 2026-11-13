/**
 * QR guest dining-session cookie helpers.
 *
 * The backend issues (and also sets) `aharqr_guest_session` after a valid QR
 * scan. It is intentionally readable by JS so the SPA can mirror it into the
 * `X-Session-Token` header on guest API calls and clear it when it goes stale.
 */
export const GUEST_SESSION_COOKIE = "aharqr_guest_session";

export function getGuestSessionCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${GUEST_SESSION_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return value || null;
}

export function setGuestSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_SESSION_COOKIE}=${encodeURIComponent(
    token,
  )}; path=/; max-age=86400; samesite=lax`;
}

export function clearGuestSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
