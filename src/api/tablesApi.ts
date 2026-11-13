import { api } from './client';

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  tableName: string;
  description?: string;
  capacity: number;
  qrVersion: number;
  isActive: boolean;
  isTakeaway: boolean;
  currentQrId?: string;
  generatedAt?: string;
  qrUrl?: string;
}

export async function fetchRestaurantTables(): Promise<{ success: boolean; tables: RestaurantTable[] }> {
  try {
    const { data } = await api.get('/settings/tables');
    return data;
  } catch {
    const { data } = await api.get('/restaurant/tables');
    return data;
  }
}

export async function createRestaurantTable(payload: { tableNumber: string; tableName: string; capacity: number; isTakeaway?: boolean }) {
  const { data } = await api.post('/restaurant/tables', payload);
  return data;
}

export async function updateRestaurantTable(tableId: string, payload: { tableNumber?: string; tableName?: string; capacity?: number; isTakeaway?: boolean; isActive?: boolean }) {
  const { data } = await api.put(`/restaurant/tables/${tableId}`, payload);
  return data;
}

export async function deleteRestaurantTable(tableId: string) {
  const { data } = await api.delete(`/restaurant/tables/${tableId}`);
  return data;
}

export async function regenerateTableQr(tableId: string): Promise<{ success: boolean; message: string; qrVersion: number; qrUrl: string }> {
  const { data } = await api.post(`/restaurant/tables/${tableId}/regenerate-qr`);
  return data;
}
