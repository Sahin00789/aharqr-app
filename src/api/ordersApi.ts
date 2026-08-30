import api from './client';

export interface StaffOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface StaffOrder {
  id: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  status: string;
  totalAmount: number;
  items: StaffOrderItem[];
  createdAt: string;
}

export async function fetchOrders(): Promise<{
  success: boolean;
  orders: StaffOrder[];
}> {
  const { data } = await api.get('/internal/orders');
  return data;
}

export async function updateOrderStatus(
  id: string,
  orderType: 'DINE_IN' | 'TAKEAWAY',
  status: string,
): Promise<{ success: boolean; order: StaffOrder }> {
  const { data } = await api.patch(`/internal/orders/${id}/status`, {
    orderType,
    status,
  });
  return data;
}

/** Tone per backend status enum (dine-in + takeaway merged). */
export const ORDER_STATUS_TONE: Record<
  string,
  'zinc' | 'green' | 'amber' | 'red' | 'indigo'
> = {
  CREATED: 'indigo',
  APPROVED: 'indigo',
  ACCEPTED_FOR_COOK: 'amber',
  PREPARED: 'green',
  COLLECTED_FROM_KITCHEN: 'green',
  SERVED: 'zinc',
  COMPLETED: 'green',
  CANCELLED: 'red',
  READY_FOR_PICKUP: 'green',
  PICKED_UP: 'green',
};

export function orderStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Linear flow used by the "advance" action for each order type. */
export function nextOrderStatus(order: StaffOrder): string | null {
  const flow: string[] =
    order.orderType === 'DINE_IN'
      ? ['CREATED', 'ACCEPTED_FOR_COOK', 'PREPARED', 'SERVED', 'COMPLETED']
      : ['CREATED', 'ACCEPTED_FOR_COOK', 'PREPARED', 'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED'];
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;
  const idx = flow.indexOf(order.status);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

export function formatINRFromRupees(amount: number): string {
  return `₹${Number(amount).toFixed(0)}`;
}
