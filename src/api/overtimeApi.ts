import api from './client';

export interface OvertimeRecord {
  id: string;
  attendanceId?: string | null;
  staffId: string;
  staffName?: string | null;
  shiftTemplateId?: string | null;
  overtimeDate?: string;
  plannedStartTime?: string | null;
  plannedEndTime?: string | null;
  actualCheckInTime?: string | null;
  actualCheckOutTime?: string | null;
  workedMinutes?: number;
  payableAmount?: number;
  remarks?: string | null;
  status: string;
  [key: string]: unknown;
}

export async function fetchOvertime(
  status?: string,
): Promise<{ success: boolean; records: OvertimeRecord[] }> {
  const { data } = await api.get('/overtime', {
    params: status ? { status } : {},
  });
  return data;
}

export async function createOvertime(payload: {
  attendanceId?: string;
  staffId: string;
  shiftTemplateId?: string;
  overtimeDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  workedMinutes: number;
  payableAmount?: number;
  remarks?: string;
}): Promise<{ success: boolean; record: OvertimeRecord }> {
  const { data } = await api.post('/overtime', payload);
  return data;
}

export async function updateOvertime(
  id: string,
  payload: {
    overtimeDate?: string;
    plannedStartTime?: string;
    plannedEndTime?: string;
    payableAmount?: number;
    remarks?: string;
  },
): Promise<{ success: boolean; record: OvertimeRecord }> {
  const { data } = await api.patch(`/overtime/${id}`, payload);
  return data;
}

export async function cancelOvertime(
  id: string,
): Promise<{ success: boolean; record: OvertimeRecord }> {
  const { data } = await api.post(`/overtime/${id}/cancel`);
  return data;
}
