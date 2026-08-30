import { api } from "./api-client";

export interface CaptainMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  employeeCode?: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  joiningDate?: string | null;
  createdAt?: string | null;
}

export interface CreateCaptainInput {
  name: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  initialPassword: string;
  joiningDate?: string;
}

export interface UpdateCaptainInput {
  name?: string;
  phone?: string;
  employeeCode?: string;
  status?: CaptainMember["status"];
  joiningDate?: string;
}

export interface CaptainListResponse {
  success: boolean;
  captains: CaptainMember[];
}

export interface CaptainDetailResponse {
  success: boolean;
  message?: string;
  captain: CaptainMember;
}

export function listCaptains(): Promise<CaptainListResponse> {
  return api("/api/captains");
}

export function getCaptainMe(): Promise<CaptainDetailResponse> {
  return api("/api/captains/me");
}

export function createCaptain(
  input: CreateCaptainInput,
): Promise<CaptainDetailResponse> {
  return api("/api/captains", { method: "POST", body: input });
}

export function updateCaptain(
  id: string,
  input: UpdateCaptainInput,
): Promise<CaptainDetailResponse> {
  return api(`/api/captains/${id}`, { method: "PATCH", body: input });
}

export function deleteCaptain(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api(`/api/captains/${id}`, { method: "DELETE" });
}