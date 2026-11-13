import { api } from "./api-client";

export interface SessionDevice {
  id: string;
  deviceId: string | null;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string | null;
  current: boolean;
}

export async function listSessions(): Promise<SessionDevice[]> {
  const res = await api<{
    success: boolean;
    data?: { sessions: SessionDevice[] };
  }>("/api/auth/devices-sessions");
  if (Array.isArray(res)) return res as SessionDevice[];
  return res.data?.sessions ?? [];
}

export function revokeSession(id: string): Promise<void> {
  return api("/api/auth/revoke-session", {
    method: "POST",
    body: { sessionId: id },
  });
}
