import api from './client';

export type StaffRole = 'CAPTAIN' | 'CHEF' | 'RESTAURANT_ADMIN';

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

const ROLE_ENDPOINT: Record<StaffRole, string> = {
  CAPTAIN: '/captains',
  CHEF: '/chefs',
  RESTAURANT_ADMIN: '/restaurant-admin',
};

export const fetchStaffRoster = async () => {
  const response = await api.get('/restaurant-admin/roster');
  return response.data;
};

export interface CreateStaffInput extends Partial<StaffMember> {
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
}

export const updateStaffMember = async (id: string, data: UpdateStaffInput) => {
  const endpoint = ROLE_ENDPOINT[data.role ?? 'CAPTAIN'];
  const response = await api.patch(`${endpoint}/${id}`, data);
  return response.data;
};