import { api } from "./api-client";

export type AttendanceActionType = "CHECK_IN" | "CHECK_OUT";
export type AttendanceWorkType = "REGULAR" | "OVERTIME";
export type AttendanceStatus =
  | "PRESENT"
  | "HALF_DAY"
  | "ABSENT"
  | "LATE"
  | "LEAVE"
  | "HOLIDAY"
  | "OFF_DAY";

export interface AttendanceRecord {
  id: string;
  staffId: string;
  shiftTemplateId?: string | null;
  attendanceDate?: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workedMinutes?: number | null;
  lateMinutes?: number | null;
  earlyLeaveMinutes?: number | null;
  status?: AttendanceStatus;
  remarks?: string | null;
  staffName?: string | null;
}

export interface GenerateAttendanceQrInput {
  shiftTemplateId: string;
  actionType: AttendanceActionType;
  workType?: AttendanceWorkType;
}

export interface GenerateAttendanceQrResult {
  success: boolean;
  token: string;
  workType?: AttendanceWorkType;
  qrTokenId: string;
}

export interface VerifyAttendanceInput {
  token: string;
  staffId: string;
}

export interface VerifyAttendanceResult {
  success: boolean;
  action: AttendanceActionType;
  record: AttendanceRecord;
}

export function generateAttendanceQr(
  input: GenerateAttendanceQrInput,
): Promise<GenerateAttendanceQrResult> {
  return api("/api/attendance/qr", { method: "POST", body: input });
}

export function verifyAttendance(
  input: VerifyAttendanceInput,
): Promise<VerifyAttendanceResult> {
  return api("/api/attendance/verify", { method: "POST", body: input });
}

export function fetchAttendanceRecords(
  from?: string,
  to?: string,
): Promise<{ success: boolean; records: AttendanceRecord[] }> {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const qs = query.toString();
  return api(`/api/attendance/records${qs ? `?${qs}` : ""}`);
}