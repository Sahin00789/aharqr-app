import { api } from "./api-client";

export type StaffRole = "CAPTAIN" | "CHEF" | "OBSERVER" | "RESTAURANT_ADMIN";
export type StaffStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  employeeCode: string;
  kitchenStation?: string;
  status: StaffStatus;
  joiningDate?: string;
  roleId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface RosterResponse {
  success: boolean;
  captains: StaffMember[];
  chefs: StaffMember[];
  observers: StaffMember[];
  allStaff: StaffMember[];
}

export interface ShiftConfigDayShift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
  presentPay: string;
  absentPay: string;
  halfDayPay: string;
  leavePay: string;
}

export interface UpdateStaffShiftConfigInput {
  offDayPayment: number;
  holidayPayment: number;
  weeklyConfigs: {
    dayId: string;
    dayName: string;
    shifts: ShiftConfigDayShift[];
  }[];
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  isUniversalOff: boolean;
  paidRate?: string;
}

export function getRoster(): Promise<RosterResponse> {
  return api("/api/restaurant-admin/roster");
}

export function getAdminMe(): Promise<{
  success: boolean;
  admin: StaffMember;
}> {
  return api("/api/restaurant-admin/me");
}

export function fetchStaffShiftConfig(
  staffId: string,
): Promise<{ success: boolean; configs: Record<string, unknown> }> {
  return api(`/api/restaurant-admin/${staffId}/shift-config`);
}

export function updateStaffShiftConfig(
  staffId: string,
  input: UpdateStaffShiftConfigInput,
): Promise<{
  success: boolean;
  message: string;
  configs: Record<string, unknown>;
}> {
  return api(`/api/restaurant-admin/${staffId}/shift-config`, {
    method: "POST",
    body: input,
  });
}

export function fetchHolidays(): Promise<{
  success: boolean;
  holidays: HolidayItem[];
}> {
  return api("/api/restaurant-admin/holidays");
}

export function createHoliday(input: {
  name: string;
  date: string;
  isUniversalOff?: boolean;
  paidRate?: string;
}): Promise<{ success: boolean; message: string; holiday: HolidayItem }> {
  return api("/api/restaurant-admin/holidays", { method: "POST", body: input });
}

export function deleteHoliday(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api(`/api/restaurant-admin/holidays/${id}`, { method: "DELETE" });
}