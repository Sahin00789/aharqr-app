import api from './client';

export type StaffRole = 'CAPTAIN' | 'CHEF' | 'OBSERVER' | 'RESTAURANT_ADMIN';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  employeeCode: string;
  kitchenStation?: string;
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  joiningDate?: string;
  address?: string;
  voterId?: string;
  roleId?: string | null;
  createdAt?: string;
}

export interface ShiftTemplate {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
}

export interface WeeklyDayShift {
  id: string;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
  graceMinutes?: number;
  lateAfterMinutes?: number;
  earlyLeaveMinutes?: number;
  operatingHours?: string;
}

export interface WeeklyDay {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  shifts: WeeklyDayShift[];
}

export interface CreateWorkingShiftInput {
  shiftName: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
  dayOfWeek: number;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  isUniversalOff: boolean;
  paidRate?: string;
}

const ROLE_ENDPOINT: Record<StaffRole, string> = {
  CAPTAIN: '/captains',
  CHEF: '/chefs',
  OBSERVER: '/observers',
  RESTAURANT_ADMIN: '/restaurant-admin',
};

export const fetchStaffRoster = async () => {
  const response = await api.get('/restaurant-admin/roster');
  return response.data;
};

export interface CreateStaffInput extends Partial<StaffMember> {
  initialPassword: string;
  joiningDate: string;
}

export const createStaffMember = async (data: CreateStaffInput) => {
  const endpoint = ROLE_ENDPOINT[data.role ?? 'CAPTAIN'];
  const response = await api.post(endpoint, data);
  return response.data;
};

export const deleteStaffMember = async (id: string, role: StaffRole = 'CAPTAIN') => {
  const endpoint = ROLE_ENDPOINT[role];
  const response = await api.delete(`${endpoint}/${id}`);
  return response.data;
};

export interface UpdateStaffInput {
  name?: string;
  phone?: string;
  role?: StaffRole;
  kitchenStation?: string;
  status?: StaffMember['status'];
  joiningDate?: string;
  address?: string;
  voterId?: string;
  newPassword?: string;
}

export const updateStaffMember = async (id: string, data: UpdateStaffInput) => {
  const endpoint = ROLE_ENDPOINT[data.role ?? 'CAPTAIN'];
  const response = await api.patch(`${endpoint}/${id}`, data);
  return response.data;
};

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
  weeklyConfigs: { dayId: string; dayName: string; shifts: ShiftConfigDayShift[] }[];
}

export const fetchStaffShiftConfig = async (staffId: string) => {
  const response = await api.get(`/restaurant-admin/${staffId}/shift-config`);
  return response.data;
};

export const updateStaffShiftConfig = async (staffId: string, configData: UpdateStaffShiftConfigInput) => {
  const response = await api.post(`/restaurant-admin/${staffId}/shift-config`, configData);
  return response.data;
};

export const fetchWorkingShiftsWeek = async () => {
  const response = await api.get('/working-shifts/week');
  return response.data;
};

export const createWorkingShift = async (data: CreateWorkingShiftInput) => {
  const response = await api.post('/working-shifts', data);
  return response.data;
};

export const deleteWorkingShift = async (id: string) => {
  const response = await api.delete(`/working-shifts/${id}`);
  return response.data;
};

export const fetchHolidays = async () => {
  const response = await api.get('/restaurant-admin/holidays');
  return response.data;
};

export const createHoliday = async (data: Partial<HolidayItem>) => {
  const response = await api.post('/restaurant-admin/holidays', data);
  return response.data;
};

export const deleteHoliday = async (id: string) => {
  const response = await api.delete(`/restaurant-admin/holidays/${id}`);
  return response.data;
};