import api from './client';

export type OrderType = 'DINE_IN' | 'TAKEAWAY';

export interface KitchenOrderItem {
  name: string | null;
  quantity: number;
  unitPrice: number;
}

export interface KitchenOrder {
  id: string;
  orderType: OrderType;
  orderNumber: string;
  tableNumber?: string | null;
  customerName?: string | null;
  status: string;
  totalAmount: number;
  items: KitchenOrderItem[];
}

export async function fetchKitchenOrders(
  status?: string,
): Promise<{ success: boolean; orders: KitchenOrder[] }> {
  const { data } = await api.get('/kitchen/orders', {
    params: status ? { status } : {},
  });
  return data;
}

export async function updateKitchenOrderStatus(
  orderType: OrderType,
  id: string,
  status: string,
): Promise<{ success: boolean; order: { id: string; status: string } }> {
  const { data } = await api.put(`/kitchen/orders/${orderType}/${id}/status`, {
    status,
  });
  return data;
}
