import api from './client';

export interface ShiftTemplate {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
  graceMinutes?: number | null;
  lateAfterMinutes?: number | null;
  earlyLeaveMinutes?: number | null;
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName?: string;
  shiftId: string;
  shiftName?: string;
  dayOfWeek: number;
  isEnabled: boolean;
  presentPay: number;
  absentPay: number;
  halfDayPay: number;
  leavePay: number;
  offDayPayment?: number;
  holidayPayment?: number;
}

export async function fetchShiftTemplates(): Promise<{
  success: boolean;
  templates: ShiftTemplate[];
}> {
  const { data } = await api.get('/working-shifts/templates');
  return data;
}

export async function createShiftTemplate(payload: {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
  graceMinutes?: number;
  lateAfterMinutes?: number;
  earlyLeaveMinutes?: number;
}): Promise<{ success: boolean; template: ShiftTemplate }> {
  const { data } = await api.post('/working-shifts/templates', payload);
  return data;
}

export async function updateShiftTemplate(
  id: string,
  payload: {
    name?: string;
    code?: string;
    startTime?: string;
    endTime?: string;
    isNightShift?: boolean;
    graceMinutes?: number;
    lateAfterMinutes?: number;
    earlyLeaveMinutes?: number;
  },
): Promise<{ success: boolean; template: ShiftTemplate }> {
  const { data } = await api.put(`/working-shifts/templates/${id}`, payload);
  return data;
}

export async function deleteShiftTemplate(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/working-shifts/templates/${id}`);
  return data;
}

export async function fetchAssignments(): Promise<{
  success: boolean;
  assignments: ShiftAssignment[];
}> {
  const { data } = await api.get('/working-shifts/assignments');
  return data;
}

export async function createAssignment(payload: {
  staffId: string;
  shiftId: string;
  dayOfWeek: number;
  isEnabled: boolean;
  presentPay: number | string;
  absentPay: number | string;
  halfDayPay: number | string;
  leavePay: number | string;
  offDayPayment?: number | string;
  holidayPayment?: number | string;
}): Promise<{ success: boolean; assignment: ShiftAssignment }> {
  const { data } = await api.post('/working-shifts/assign', payload);
  return data;
}

export interface WeeklyDayInput {
  dayOfWeek: number;
  shiftId: string | null;
  isEnabled?: boolean;
}

export async function createWeeklyAssignment(payload: {
  staffId: string;
  days: WeeklyDayInput[];
  presentPay?: number | string;
  halfDayPay?: number | string;
  absentPay?: number | string;
  leavePay?: number | string;
  offDayPayment?: number | string;
  holidayPayment?: number | string;
}): Promise<{ success: boolean; assignments: ShiftAssignment[] }> {
  const { data } = await api.post('/working-shifts/assign-weekly', payload);
  return data;
}
