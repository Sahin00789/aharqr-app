import { api } from './client';

export interface DineInOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber?: string;
  guestCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  currentStatus: 'CREATED' | 'APPROVED' | 'ACCEPTED_FOR_COOK' | 'PREPARED' | 'COLLECTED_FROM_KITCHEN' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  tableName?: string;
  status?: string;
  items?: { name: string; quantity: number; price: number }[];
  notes?: string;
  createdByType: 'CUSTOMER_QR' | 'CAPTAIN' | 'ADMIN';
  createdAt: string;
}

export async function fetchDineInOrders(): Promise<{ success: boolean; orders: DineInOrder[] }> {
  try {
    const { data } = await api.get('/dine-in/orders');
    return data;
  } catch (error) {
    return {
      success: true,
      orders: [],
    };
  }
}

export async function createDineInOrder(payload: { tableId: string; guestCount: number; items: { menuId: string; quantity: number; unitPrice: number; remarks?: string }[]; notes?: string }) {
  const { data } = await api.post('/dine-in/orders', payload);
  return data;
}

export async function updateDineInOrderStatus(orderId: string, status: DineInOrder['currentStatus'], remarks?: string) {
  const { data } = await api.patch(`/dine-in/orders/${orderId}/status`, { status, remarks });
  return data;
}

export async function fetchDineInOrderTimeline(orderId: string) {
  try {
    const { data } = await api.get(`/dine-in/orders/${orderId}/timeline`);
    return data;
  } catch (error) {
    return {
      success: true,
      timeline: [],
    };
  }
}
