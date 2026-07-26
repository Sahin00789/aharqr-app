import api from './client';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CAPTAIN' | 'CHEF' | 'RESTAURANT_ADMIN';
  employeeCode: string;
  kitchenStation?: string;
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface ShiftTemplate {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  isUniversalOff: boolean;
  paidRate?: string;
}

export const fetchStaffRoster = async () => {
  const response = await api.get('/staff/roster');
  return response.data;
};

export const createStaffMember = async (data: Partial<StaffMember>) => {
  const response = await api.post('/staff', data);
  return response.data;
};

export const deleteStaffMember = async (id: string) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};

export const fetchStaffShiftConfig = async (staffId: string) => {
  const response = await api.get(`/staff/${staffId}/shift-config`);
  return response.data;
};

export const updateStaffShiftConfig = async (staffId: string, configData: any) => {
  const response = await api.post(`/staff/${staffId}/shift-config`, configData);
  return response.data;
};

export const fetchWorkingShifts = async () => {
  const response = await api.get('/staff/shifts');
  return response.data;
};

export const createWorkingShift = async (data: Partial<ShiftTemplate>) => {
  const response = await api.post('/staff/shifts', data);
  return response.data;
};

export const deleteWorkingShift = async (id: string) => {
  const response = await api.delete(`/staff/shifts/${id}`);
  return response.data;
};

export const fetchHolidays = async () => {
  const response = await api.get('/staff/holidays');
  return response.data;
};

export const createHoliday = async (data: Partial<HolidayItem>) => {
  const response = await api.post('/staff/holidays', data);
  return response.data;
};

export const deleteHoliday = async (id: string) => {
  const response = await api.delete(`/staff/holidays/${id}`);
  return response.data;
};
