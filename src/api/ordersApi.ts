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
  customerPhone?: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  items: StaffOrderItem[];
  createdAt: string;
  gstRate?: number;
  showTaxBreakdown?: boolean;
  taxMode?: 'INCLUSIVE' | 'EXCLUSIVE';
}

/** Immutable lifecycle event from `order_trail` (order-level + per-item rows). */
export interface OrderTrail {
  id: string;
  orderId: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  orderItemId: string | null;
  dishId: string | null;
  dishName: string;
  action: string;
  status: string;
  performedByType: 'CUSTOMER' | 'CAPTAIN' | 'CHEF' | 'ADMIN' | 'SYSTEM';
  performedByStaffId: string | null;
  performedByName: string;
  durationSeconds: number | null;
  remarks: string | null;
  createdAt: string;
}

export async function fetchOrderTrails(orderId: string): Promise<{
  success: boolean;
  trails: OrderTrail[];
}> {
  const { data } = await api.get(`/internal/orders/${orderId}/trails`);
  return data;
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

/** Undo the last status change (one step back). Requires existing trail. */
export async function rollbackOrder(
  id: string,
  orderType: 'DINE_IN' | 'TAKEAWAY',
): Promise<{ success: boolean; order: StaffOrder }> {
  const { data } = await api.patch(`/internal/orders/${id}/rollback`, {
    orderType,
  });
  return data;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER';

/** Append new items to an existing order (admin / captain only). */
export async function addOrderItems(
  id: string,
  orderType: 'DINE_IN' | 'TAKEAWAY',
  items: { menuId: string; quantity: number }[],
): Promise<{ success: boolean; order: StaffOrder }> {
  const { data } = await api.post(`/internal/orders/${id}/items`, {
    orderType,
    items,
  });
  return data;
}

/** Whether the role may append items to the order in its current state —
 *  admins and captains only, and never once it is finished, cancelled or paid. */
export function canAddItems(
  order: StaffOrder,
  role?: StaffOrderRole,
): boolean {
  if (role && role !== 'ADMIN' && role !== 'CAPTAIN') return false;
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return false;
  if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED') {
    return false;
  }
  return true;
}

/** Record customer payment on an approved order (admin / captain only). */
export async function recordOrderPayment(
  id: string,
  orderType: 'DINE_IN' | 'TAKEAWAY',
  method: PaymentMethod,
): Promise<{ success: boolean; order: StaffOrder }> {
  const { data } = await api.patch(`/internal/orders/${id}/payment`, {
    orderType,
    method,
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
  PAID: 'green',
};

/** Tone per payment status. */
export const PAYMENT_STATUS_TONE: Record<
  string,
  'zinc' | 'green' | 'amber' | 'red' | 'indigo'
> = {
  UNPAID: 'amber',
  PARTIALLY_PAID: 'amber',
  PAID: 'green',
  REFUNDED: 'red',
};

export function paymentStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Unpaid';
  return orderStatusLabel(status);
}

/** Whether an order is eligible for payment: approved or later, not yet paid,
 *  and not created/cancelled. Payments are taken by admins and captains. */
export function canTakePayment(order: StaffOrder): boolean {
  if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED') {
    return false;
  }
  return order.status !== 'CREATED' && order.status !== 'CANCELLED';
}

export function orderStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Tone per trail action. */
export const ORDER_ACTION_TONE: Record<
  string,
  'zinc' | 'green' | 'amber' | 'red' | 'indigo'
> = {
  CREATED: 'indigo',
  APPROVED: 'indigo',
  ACCEPTED: 'amber',
  PREPARED: 'green',
  COLLECTED: 'green',
  SERVED: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
  PAID: 'green',
  ADDED: 'indigo',
};

export function orderActionLabel(action: string): string {
  return orderStatusLabel(action);
}

/** Human-friendly duration, e.g. 45s, 3m, 3m 12s. */
export function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function actorRoleLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

/** Linear flow used by the "advance" action for each order type. */
export function nextOrderStatus(order: StaffOrder): string | null {
  const flow: string[] =
    order.orderType === 'DINE_IN'
        ? ['CREATED', 'APPROVED', 'ACCEPTED_FOR_COOK', 'PREPARED', 'SERVED', 'COMPLETED']
        : ['CREATED', 'APPROVED', 'ACCEPTED_FOR_COOK', 'PREPARED', 'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED'];
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;
  const idx = flow.indexOf(order.status);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

export type StaffOrderRole = 'ADMIN' | 'CAPTAIN' | 'CHEF';

/**
 * Admin approves new orders and handles service handoff/completion; the chef
 * owns the cooking pipeline.
 */
export function nextAdminAction(order: StaffOrder): string | null {
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;
  if (order.status === 'CREATED') return 'APPROVED';
  if (order.orderType === 'DINE_IN') {
    if (order.status === 'PREPARED') return 'SERVED';
    if (order.status === 'SERVED') {
      return order.paymentStatus === 'PAID' ? 'COMPLETED' : null;
    }
    return null; // Kitchen steps belong to the chef
  }
  if (order.status === 'READY_FOR_PICKUP') return 'PICKED_UP';
  if (order.status === 'PICKED_UP') {
    return order.paymentStatus === 'PAID' ? 'COMPLETED' : null;
  }
  return null; // Kitchen steps belong to the chef
}

/** Role-aware next action, mirroring server-side transition rights.
 *  Captain approves new orders and serves/hands over; chef owns the kitchen pipeline
 *  (accept → prepare → ready); admin manages handover + completion (and
 *  always cancels), never the cook steps. */
export function nextActionForRole(
  order: StaffOrder,
  role: StaffOrderRole,
): string | null {
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;

  if (role === 'CAPTAIN') {
    if (order.status === 'CREATED') return 'APPROVED';
    if (order.orderType === 'DINE_IN') {
      if (order.status === 'PREPARED') return 'SERVED';
      if (order.status === 'SERVED' && order.paymentStatus === 'PAID')
        return 'COMPLETED';
      return null;
    }
    if (order.status === 'READY_FOR_PICKUP') return 'PICKED_UP';
    if (order.status === 'PICKED_UP' && order.paymentStatus === 'PAID')
      return 'COMPLETED';
    return null;
  }

  if (role === 'CHEF') {
    if (order.status === 'APPROVED') return 'ACCEPTED_FOR_COOK';
    if (order.status === 'ACCEPTED_FOR_COOK') return 'PREPARED';
    if (order.status === 'PREPARED' && order.orderType === 'TAKEAWAY')
      return 'READY_FOR_PICKUP';
    return null;
  }

  return nextAdminAction(order);
}

/** Whether the role may cancel the order in its current state — captains can
 *  only cancel before the kitchen accepts; admin can always cancel. */
export function canCancelForRole(
  order: StaffOrder,
  role: StaffOrderRole,
): boolean {
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return false;
  if (role === 'CAPTAIN') {
    return order.status === 'CREATED' || order.status === 'APPROVED';
  }
  if (role === 'CHEF') {
    return (
      order.status === 'CREATED' ||
      order.status === 'APPROVED' ||
      order.status === 'ACCEPTED_FOR_COOK' ||
      order.status === 'PREPARED'
    );
  }
  return true;
}

export function formatINRFromRupees(amount: number): string {
  return `₹${Number(amount).toFixed(0)}`;
}
