import { api } from "./api-client";

export interface ObserverMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  employeeCode?: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  joiningDate?: string | null;
  createdAt?: string | null;
}

export interface CreateObserverInput {
  name: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  initialPassword: string;
  joiningDate?: string;
}

export interface UpdateObserverInput {
  name?: string;
  phone?: string;
  employeeCode?: string;
  status?: ObserverMember["status"];
  joiningDate?: string;
}

export interface ObserverListResponse {
  success: boolean;
  observers: ObserverMember[];
}

export interface ObserverDetailResponse {
  success: boolean;
  message?: string;
  observer: ObserverMember;
}

export function listObservers(): Promise<ObserverListResponse> {
  return api("/api/observers");
}

export function getObserverMe(): Promise<ObserverDetailResponse> {
  return api("/api/observers/me");
}

export function createObserver(
  input: CreateObserverInput,
): Promise<ObserverDetailResponse> {
  return api("/api/observers", { method: "POST", body: input });
}

export function updateObserver(
  id: string,
  input: UpdateObserverInput,
): Promise<ObserverDetailResponse> {
  return api(`/api/observers/${id}`, { method: "PATCH", body: input });
}

export function deleteObserver(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api(`/api/observers/${id}`, { method: "DELETE" });
}