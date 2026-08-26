import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  itemId: string;
  name: string;
  price: number; // in paise
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  setQty: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
}

/** Guest cart — survives refreshes via sessionStorage, cleared on order. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.itemId === item.itemId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.itemId === item.itemId ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: 1 }] };
        }),
      setQty: (itemId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.itemId !== itemId)
              : s.items.map((i) =>
                  i.itemId === itemId
                    ? { ...i, qty: Math.min(qty, 20) }
                    : i,
                ),
        })),
      removeItem: (itemId) =>
        set((s) => ({ items: s.items.filter((i) => i.itemId !== itemId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "aharqr-cart",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
