import { api } from './client';

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  tableName: string;
  description?: string;
  capacity: number;
  qrVersion: number;
  isActive: boolean;
  currentQrId?: string;
  generatedAt?: string;
}

export async function fetchRestaurantTables(): Promise<{ success: boolean; tables: RestaurantTable[] }> {
  try {
    const { data } = await api.get('/settings/tables');
    return data;
  } catch (error) {
    const { data } = await api.get('/restaurant/tables');
    return data;
  }
}

export async function createRestaurantTable(payload: { tableNumber: string; tableName: string; capacity: number }) {
  const { data } = await api.post('/restaurant/tables', payload);
  return data;
}

export async function updateRestaurantTable(tableId: string, payload: { tableNumber?: string; tableName?: string; capacity?: number }) {
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

export async function downloadTableQrPdf(tableIds: string[]): Promise<void> {
  try {
    const response = await api.post('/settings/download-qr', { tableIds }, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AharQR_Table_Stickers.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const response = await api.post('/restaurant/tables/download-qr-pdf', { tableIds }, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AharQR_Table_Stickers.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
