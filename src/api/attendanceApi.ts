import api from './client';

export type AttendanceActionType = 'CHECK_IN' | 'CHECK_OUT';
export type AttendanceWorkType = 'REGULAR' | 'OVERTIME';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  shiftTemplateId?: string | null;
  actionType?: AttendanceActionType | null;
  workType?: AttendanceWorkType | null;
  status?: string;
  recordDate?: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  [key: string]: unknown;
}

export async function generateAttendanceQr(payload: {
  shiftTemplateId: string;
  actionType: AttendanceActionType;
  workType: AttendanceWorkType;
}): Promise<{ success: boolean; token: string }> {
  const { data } = await api.post('/attendance/qr', payload);
  return data;
}

export async function verifyAttendance(payload: {
  token: string;
  staffId: string;
}): Promise<{ success: boolean; action: string; record: AttendanceRecord }> {
  const { data } = await api.post('/attendance/verify', payload);
  return data;
}

export async function fetchAttendanceRecords(
  from?: string,
  to?: string,
): Promise<{ success: boolean; records: AttendanceRecord[] }> {
  const { data } = await api.get('/attendance/records', {
    params: { from: from ?? '', to: to ?? '' },
  });
  return data;
}

export type AttendanceStatusAction =
  | 'SHIFT_CHECK_IN'
  | 'SHIFT_CHECK_OUT'
  | 'CREATE_OVERTIME'
  | 'OVERTIME_CHECK_IN'
  | 'OVERTIME_CHECK_OUT';

export interface StaffAttendanceStatus {
  success: boolean;
  date: string;
  shift: {
    shiftTemplateId: string;
    name: string;
    startTime: string;
    endTime: string;
    isNightShift: boolean;
    graceMinutes: number;
  } | null;
  inShiftWindow: boolean;
  isNightShift: boolean;
  attendance: {
    id: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    shiftTemplateId: string;
  } | null;
  overtime: {
    id: string;
    status: string;
    actualCheckInTime: string | null;
    actualCheckOutTime: string | null;
    shiftTemplateId: string;
    plannedStartTime: string | null;
  } | null;
  action: AttendanceStatusAction;
}

export async function fetchStaffAttendanceStatus(
  staffId: string,
): Promise<StaffAttendanceStatus> {
  const { data } = await api.get(`/attendance/status/${staffId}`);
  return data;
}
