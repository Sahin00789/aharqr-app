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

export interface GuestTaxConfig {
  gstRate: number;
  taxMode: "INCLUSIVE" | "EXCLUSIVE";
  showTaxBreakdown: boolean;
}

export interface PublicMenu {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    phone?: string | null;
    shortAddress?: string | null;
    gstRate?: number;
    taxMode?: "INCLUSIVE" | "EXCLUSIVE";
    showTaxBreakdown?: boolean;
  };
  categories: { id: string; name: string }[];
  items: MenuItem[];
}

/** Mirrors the server-side GST calculation (subtotal in paise). */
export function computeGst(
  subtotalPaise: number,
  cfg: { gstRate: number; taxMode: "INCLUSIVE" | "EXCLUSIVE" },
): { subtotalPaise: number; taxPaise: number; totalPaise: number } {
  if (subtotalPaise <= 0 || cfg.gstRate <= 0) {
    return { subtotalPaise, taxPaise: 0, totalPaise: subtotalPaise };
  }
  if (cfg.taxMode === "EXCLUSIVE") {
    const taxPaise = Math.round((subtotalPaise * cfg.gstRate) / 100);
    return { subtotalPaise, taxPaise, totalPaise: subtotalPaise + taxPaise };
  }
  const taxPaise = Math.round(
    (subtotalPaise * cfg.gstRate) / (100 + cfg.gstRate),
  );
  return { subtotalPaise, taxPaise, totalPaise: subtotalPaise };
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
  /** Order-level lifecycle events, oldest first (for the tracking timeline). */
  trail?: {
    action: string;
    status: string;
    createdAt: string;
    performedByType: string;
    performedByName: string;
  }[];
}

/**
 * Public endpoints consumed by QR-scanned guests — no auth. The guest dining
 * session id travels in the `aharqr_guest_session` cookie / `X-Session-Token`
 * header (attached automatically by the api client), and the backend resolves
 * the restaurant + table from it.
 */
export function getPublicMenu(): Promise<PublicMenu> {
  return api<PublicMenu>(`/api/menu`, { auth: false });
}

export function placeGuestOrder(input: {
  items: { itemId: string; quantity: number }[];
  customerName?: string;
  customerPhone?: string;
  note?: string;
}): Promise<PlacedOrder> {
  return api<PlacedOrder>(`/api/order`, {
    method: "POST",
    auth: false,
    body: {
      items: input.items,
      notes: input.note,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    },
  });
}

export function getGuestOrders(): Promise<{
  success: boolean;
  tableNumber: string;
  tax?: GuestTaxConfig;
  orders: GuestOrder[];
}> {
  return api(`/api/guest/orders`, { auth: false });
}
