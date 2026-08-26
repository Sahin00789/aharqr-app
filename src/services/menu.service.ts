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
  status: string;
  tableNumber: string;
  totalAmount: number;
  createdAt: string;
}

/**
 * Public endpoints consumed by QR-scanned guests — no auth.
 *
 * Backend modules for these are planned but NOT implemented yet; the UI
 * shows a friendly empty/error state until they ship.
 */
export function getPublicMenu(restaurantSlug: string): Promise<PublicMenu> {
  return api(`/api/v1/public/${encodeURIComponent(restaurantSlug)}/menu`, {
    auth: false,
  });
}

export function placeGuestOrder(
  restaurantSlug: string,
  input: {
    tableNumber: string;
    items: { itemId: string; quantity: number }[];
    customerName?: string;
    note?: string;
  },
): Promise<PlacedOrder> {
  return api(`/api/v1/public/${encodeURIComponent(restaurantSlug)}/orders`, {
    method: "POST",
    auth: false,
    body: input,
  });
}
