import { api } from "./api-client";

export interface ChefMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  employeeCode?: string | null;
  kitchenStation?: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  joiningDate?: string | null;
  createdAt?: string | null;
}

export interface CreateChefInput {
  name: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  kitchenStation?: string;
  joiningDate?: string;
}

export interface UpdateChefInput {
  name?: string;
  phone?: string;
  employeeCode?: string;
  kitchenStation?: string;
  status?: ChefMember["status"];
  joiningDate?: string;
}

export interface ChefListResponse {
  success: boolean;
  chefs: ChefMember[];
}

export interface ChefDetailResponse {
  success: boolean;
  message?: string;
  chef: ChefMember;
}

export function listChefs(): Promise<ChefListResponse> {
  return api("/api/chefs");
}

export function getChefMe(): Promise<ChefDetailResponse> {
  return api("/api/chefs/me");
}

export function createChef(
  input: CreateChefInput,
): Promise<ChefDetailResponse> {
  return api("/api/chefs", { method: "POST", body: input });
}

export function updateChef(
  id: string,
  input: UpdateChefInput,
): Promise<ChefDetailResponse> {
  return api(`/api/chefs/${id}`, { method: "PATCH", body: input });
}

export function deleteChef(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api(`/api/chefs/${id}`, { method: "DELETE" });
}