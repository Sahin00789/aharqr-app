import { api } from "./api-client";

export interface SessionDevice {
  id: string;
  deviceId: string | null;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export function listSessions(): Promise<SessionDevice[]> {
  return api<SessionDevice[]>("/api/auth/devices-sessions");
}

export function revokeSession(id: string): Promise<void> {
  return api("/api/auth/revoke-session", {
    method: "POST",
    body: { sessionId: id },
  });
}
