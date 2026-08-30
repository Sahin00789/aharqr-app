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
  // Backend returns JSON with restaurant + per-table QR data; the PDF is
  // rendered in the browser with pdfmake (see utils/qrPdfGenerator).
  const fetchData = async (url: string) => {
    const { data } = await api.post(url, { tableIds });
    return data as {
      success: boolean;
      restaurant: { name: string; address: string; logoUrl?: string | null; slug?: string };
      tables: {
        tableNumber: string;
        tableName?: string;
        description?: string;
        capacity?: number;
        qrUrl: string;
      }[];
    };
  };

  let payload: Awaited<ReturnType<typeof fetchData>>;
  try {
    payload = await fetchData('/settings/download-qr');
  } catch {
    payload = await fetchData('/restaurant/tables/download-qr-pdf');
  }

  const { downloadQrStickersPdf } = await import('../utils/qrPdfGenerator');
  await downloadQrStickersPdf(payload.restaurant, payload.tables);
}
