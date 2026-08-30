import { api } from "./api-client";

export type OvertimeStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED";

export interface OvertimeRecord {
  id: string;
  restaurantId?: string;
  attendanceId: string;
  staffId: string;
  shiftTemplateId: string;
  overtimeDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualCheckInTime?: string | null;
  actualCheckOutTime?: string | null;
  workedMinutes: number;
  status: OvertimeStatus;
  remarks?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  staffName?: string | null;
}

export interface CreateOvertimeInput {
  attendanceId: string;
  staffId: string;
  shiftTemplateId: string;
  overtimeDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  workedMinutes: number;
  remarks?: string;
}

export function fetchOvertime(
  status?: OvertimeStatus,
): Promise<{ success: boolean; records: OvertimeRecord[] }> {
  const query = status ? `?status=${status}` : "";
  return api(`/api/overtime${query}`);
}

export function createOvertime(
  input: CreateOvertimeInput,
): Promise<{ success: boolean; record: OvertimeRecord }> {
  return api("/api/overtime", { method: "POST", body: input });
}

export type OvertimeQrActionType = "CHECK_IN" | "CHECK_OUT";

export interface OvertimeQrResult {
  success: boolean;
  token: string;
  overtimeId?: string;
  actionType: OvertimeQrActionType;
  expiresInSeconds?: number;
}

export interface OvertimeVerifyResult {
  success: boolean;
  message: string;
  actionType: OvertimeQrActionType;
  workType?: "REGULAR" | "OVERTIME";
  timestamp?: string;
  shiftStatus?: string;
  staff?: { id: string; name: string; employeeCode: string; role: string };
  record?: OvertimeRecord;
}

/** Admin fetches the signed QR token for a pending overtime record (check-in). */
export function getOvertimeCheckInQr(
  overtimeId?: string,
): Promise<OvertimeQrResult> {
  const query = overtimeId
    ? `?overtimeId=${encodeURIComponent(overtimeId)}`
    : "";
  return api(`/api/overtime/check-in-qr${query}`);
}

/** Admin fetches the signed QR token for a checked-in overtime record (check-out). */
export function getOvertimeCheckOutQr(
  overtimeId?: string,
): Promise<OvertimeQrResult> {
  const query = overtimeId
    ? `?overtimeId=${encodeURIComponent(overtimeId)}`
    : "";
  return api(`/api/overtime/check-out-qr${query}`);
}

/** Staff (chef/captain) scan the QR to verify overtime check-in. */
export function verifyOvertimeCheckInQr(token: string): Promise<OvertimeVerifyResult> {
  return api("/api/overtime/check-in/verify", { method: "POST", body: { token } });
}

/** Staff (chef/captain) scan the QR to verify overtime check-out. */
export function verifyOvertimeCheckOutQr(token: string): Promise<OvertimeVerifyResult> {
  return api("/api/overtime/check-out/verify", { method: "POST", body: { token } });
}