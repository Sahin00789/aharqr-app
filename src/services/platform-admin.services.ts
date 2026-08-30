import { api } from "./api-client";

export interface PlatformAdminMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  createdAt?: string | null;
}

export interface CreatePlatformAdminInput {
  name: string;
  email: string;
  phone?: string;
  initialPassword: string;
}

export interface UpdatePlatformAdminInput {
  name?: string;
  phone?: string;
  status?: PlatformAdminMember["status"];
}

export interface PlatformAdminListResponse {
  success: boolean;
  platformAdmins: PlatformAdminMember[];
}

export interface PlatformAdminDetailResponse {
  success: boolean;
  message?: string;
  platformAdmin: PlatformAdminMember;
}

export function listPlatformAdmins(): Promise<PlatformAdminListResponse> {
  return api("/api/platform-admins");
}

export function getPlatformAdminMe(): Promise<PlatformAdminDetailResponse> {
  return api("/api/platform-admins/me");
}

export function createPlatformAdmin(
  input: CreatePlatformAdminInput,
): Promise<PlatformAdminDetailResponse> {
  return api("/api/platform-admins", { method: "POST", body: input });
}

export function updatePlatformAdmin(
  id: string,
  input: UpdatePlatformAdminInput,
): Promise<PlatformAdminDetailResponse> {
  return api(`/api/platform-admins/${id}`, { method: "PATCH", body: input });
}

export function deletePlatformAdmin(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api(`/api/platform-admins/${id}`, { method: "DELETE" });
}