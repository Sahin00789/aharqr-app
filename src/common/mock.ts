/** In-memory demo data. The backend services are not deployed yet, so the
 * workspace screens render against this local dataset to stay fully
 * interactive. Swap these out for react-query results once APIs ship. */

export type OrderStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "BILLED"
  | "CANCELLED";

export interface TableSeat {
  number: string;
  seats: number;
  status: "FREE" | "OCCUPIED" | "RESERVED";
  party?: number;
}

export interface OrderRow {
  id: string;
  table: string;
  items: { name: string; qty: number; price: number }[];
  status: OrderStatus;
  createdAt: string;
  total: number;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  stock: number;
}

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CAPTAIN" | "CHEF" | "OBSERVER";
  isActive: boolean;
  lastSeen: string;
}

export const MOCK_TABLES: TableSeat[] = [
  { number: "1", seats: 2, status: "OCCUPIED", party: 2 },
  { number: "2", seats: 4, status: "OCCUPIED", party: 3 },
  { number: "3", seats: 2, status: "FREE" },
  { number: "4", seats: 6, status: "RESERVED", party: 5 },
  { number: "5", seats: 4, status: "OCCUPIED", party: 4 },
  { number: "6", seats: 2, status: "FREE" },
  { number: "7", seats: 4, status: "FREE" },
  { number: "8", seats: 8, status: "OCCUPIED", party: 7 },
];

export const MOCK_ORDERS: OrderRow[] = [
  {
    id: "ord_1024",
    table: "2",
    status: "NEW",
    createdAt: "12:42",
    total: 68000,
    items: [
      { name: "Paneer Tikka", qty: 1, price: 32000 },
      { name: "Butter Naan", qty: 2, price: 8000 },
    ],
  },
  {
    id: "ord_1023",
    table: "5",
    status: "PREPARING",
    createdAt: "12:35",
    total: 124000,
    items: [
      { name: "Chicken Biryani", qty: 2, price: 42000 },
      { name: "Gulab Jamun", qty: 3, price: 12000 },
    ],
  },
  {
    id: "ord_1021",
    table: "8",
    status: "READY",
    createdAt: "12:20",
    total: 210000,
    items: [
      { name: "Masala Dosa", qty: 4, price: 30000 },
      { name: "Filter Coffee", qty: 4, price: 9000 },
    ],
  },
  {
    id: "ord_1018",
    table: "1",
    status: "SERVED",
    createdAt: "12:05",
    total: 45000,
    items: [{ name: "Veg Thali", qty: 2, price: 22500 }],
  },
];

export const MOCK_DISHES: Dish[] = [
  { id: "d1", name: "Paneer Tikka", category: "Main", price: 32000, isVeg: true, isAvailable: true, stock: 12 },
  { id: "d2", name: "Butter Chicken", category: "Main", price: 38000, isVeg: false, isAvailable: true, stock: 8 },
  { id: "d3", name: "Masala Dosa", category: "South", price: 18000, isVeg: true, isAvailable: true, stock: 20 },
  { id: "d4", name: "Chicken Biryani", category: "Main", price: 42000, isVeg: false, isAvailable: false, stock: 0 },
  { id: "d5", name: "Gulab Jamun", category: "Dessert", price: 12000, isVeg: true, isAvailable: true, stock: 30 },
  { id: "d6", name: "Filter Coffee", category: "Beverage", price: 9000, isVeg: true, isAvailable: true, stock: 25 },
];

export const MOCK_STAFF: StaffRow[] = [
  { id: "u1", name: "Asha Menon", email: "asha@aharqr.dev", role: "ADMIN", isActive: true, lastSeen: "Just now" },
  { id: "u2", name: "Ravi Kumar", email: "ravi@aharqr.dev", role: "CAPTAIN", isActive: true, lastSeen: "3m ago" },
  { id: "u3", name: "Priya Nair", email: "priya@aharqr.dev", role: "CHEF", isActive: true, lastSeen: "1m ago" },
  { id: "u4", name: "Tom Varghese", email: "tom@aharqr.dev", role: "OBSERVER", isActive: false, lastSeen: "2h ago" },
  { id: "u5", name: "Neha Singh", email: "neha@aharqr.dev", role: "CAPTAIN", isActive: true, lastSeen: "12m ago" },
];

export const MOCK_SALES = [
  { label: "Today", revenue: 184500, orders: 42 },
  { label: "Yesterday", revenue: 162300, orders: 38 },
  { label: "This week", revenue: 1102400, orders: 251 },
  { label: "This month", revenue: 4389000, orders: 1042 },
];

export const STATUS_TONE: Record<OrderStatus, "zinc" | "green" | "amber" | "red" | "indigo"> = {
  NEW: "indigo",
  PREPARING: "amber",
  READY: "green",
  SERVED: "zinc",
  BILLED: "green",
  CANCELLED: "red",
};

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}
