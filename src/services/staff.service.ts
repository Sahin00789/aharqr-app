import type { StaffMember, UserRole } from "../types";
import { api } from "./api-client";

export interface CreateStaffInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Omit to have the backend generate a one-time password. */
  password?: string;
}

export interface CreateStaffResult {
  user: StaffMember;
  temporaryPassword?: string;
}

export function createStaff(input: CreateStaffInput): Promise<CreateStaffResult> {
  return api("/api/v1/users", { method: "POST", body: input });
}

export function listStaff(params?: {
  role?: UserRole;
  isActive?: boolean;
}): Promise<StaffMember[]> {
  const query = new URLSearchParams();
  if (params?.role) query.set("role", params.role);
  if (params?.isActive !== undefined)
    query.set("isActive", String(params.isActive));
  const qs = query.toString();
  return api(`/api/v1/users${qs ? `?${qs}` : ""}`);
}

export function setStaffStatus(
  userId: string,
  isActive: boolean,
): Promise<StaffMember> {
  return api(`/api/v1/users/${userId}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}
