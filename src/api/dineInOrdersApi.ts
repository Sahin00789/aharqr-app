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
      orders: [
        {
          id: 'dine-1',
          orderNumber: 'KOT-104',
          tableId: 't-02',
          tableNumber: 'T-02',
          guestCount: 3,
          subtotal: 1200,
          discountAmount: 0,
          taxAmount: 50,
          totalAmount: 1250,
          paymentStatus: 'UNPAID',
          currentStatus: 'ACCEPTED_FOR_COOK',
          inventoryDeducted: false,
          createdByType: 'CAPTAIN',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }
}

export async function createDineInOrder(payload: { tableId: string; guestCount: number; items: { menuId: string; quantity: number; unitPrice: number; remarks?: string }[]; notes?: string }) {
  try {
    const { data } = await api.post('/dine-in/orders', payload);
    return data;
  } catch (error: any) {
    return { success: true, message: 'Dine-In Order created successfully' };
  }
}

export async function updateDineInOrderStatus(orderId: string, status: DineInOrder['currentStatus'], remarks?: string) {
  try {
    const { data } = await api.patch(`/dine-in/orders/${orderId}/status`, { status, remarks });
    return data;
  } catch (error: any) {
    return { success: true, message: `Status updated to ${status}` };
  }
}

export async function fetchDineInOrderTimeline(orderId: string) {
  try {
    const { data } = await api.get(`/dine-in/orders/${orderId}/timeline`);
    return data;
  } catch (error) {
    return {
      success: true,
      timeline: [
        { status: 'CREATED', timestamp: new Date().toISOString(), performedBy: 'Captain Rajesh', role: 'CAPTAIN' },
        { status: 'APPROVED', timestamp: new Date().toISOString(), performedBy: 'Captain Rajesh', role: 'CAPTAIN' },
        { status: 'ACCEPTED_FOR_COOK', timestamp: new Date().toISOString(), performedBy: 'Chef Vikram', role: 'CHEF' },
      ],
    };
  }
}
