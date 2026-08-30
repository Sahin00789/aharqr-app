import { api } from "./api-client";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  /** Stored in paise to avoid float issues. */
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string | null;
  categoryName: string;
}

export interface PublicMenu {
  restaurant: { id: string; name: string; slug: string };
  categories: { id: string; name: string }[];
  items: MenuItem[];
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  status: string;
  tableNumber: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  createdAt: string;
}

export interface GuestOrderItem {
  id: string;
  menuId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  remarks?: string | null;
}

export interface GuestOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  createdAt: string;
  items: GuestOrderItem[];
}

/**
 * Public endpoints consumed by QR-scanned guests — no auth. The backend
 * resolves the restaurant by slug and the table by number (the QR params),
 * and lazily creates the dining session on the first order.
 */
export function getPublicMenu(
  restaurantSlug: string,
  tableNumber?: string
): Promise<PublicMenu> {
  const qs = new URLSearchParams({ restaurant: restaurantSlug });
  if (tableNumber) qs.set("table", tableNumber);
  return api<PublicMenu>(`/api/menu?${qs.toString()}`, { auth: false });
}

export function placeGuestOrder(
  restaurantSlug: string,
  input: {
    tableNumber: string;
    items: { itemId: string; quantity: number }[];
    customerName?: string;
    note?: string;
  }
): Promise<PlacedOrder> {
  return api<PlacedOrder>(`/api/order`, {
    method: "POST",
    auth: false,
    body: {
      restaurant: restaurantSlug,
      table: input.tableNumber,
      items: input.items,
      notes: input.note,
      customerName: input.customerName,
    },
  });
}

export function getGuestOrders(
  restaurantSlug: string,
  tableNumber: string
): Promise<{ success: boolean; tableNumber: string; orders: GuestOrder[] }> {
  const qs = new URLSearchParams({ restaurant: restaurantSlug, table: tableNumber });
  return api(`/api/guest/orders?${qs.toString()}`, { auth: false });
}
