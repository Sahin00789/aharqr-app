import api from './client';

export interface AnalyticsPoint {
  key: string;
  orders: number;
  revenue: number;
}

export interface HourPoint {
  hour: number;
  label: string;
  revenue: number;
  orders: number;
}

export interface SourceBucket {
  key: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface ChannelBucket {
  key: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface TopDish {
  name: string;
  quantity: number;
  revenue: number;
}

export interface DashboardKpis {
  revenue: number;
  previousRevenue: number;
  revenueChangePct: number;
  orders: number;
  previousOrders: number;
  ordersChangePct: number;
  avgOrderValue: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  activeOrders: number;
  openTables: number;
  totalTables: number;
  staffTotal: number;
  todayRevenue: number;
  todayOrders: number;
}

export interface DashboardAnalytics {
  success: boolean;
  range: { days: number; month?: string | null; since: string; until: string };
  kpis: DashboardKpis;
  salesTrend: AnalyticsPoint[];
  revenueByHour: HourPoint[];
  sourceSplit: SourceBucket[];
  channelSplit: ChannelBucket[];
  topDishes: TopDish[];
}

export async function fetchDashboardAnalytics(params?: {
  days?: number;
  month?: string;
}): Promise<DashboardAnalytics> {
  const { data } = await api.get('/reports/analytics', {
    params: params ?? { days: 7 },
  });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Full monthly report (summary + every order + staff performance)   */
/* ------------------------------------------------------------------ */

export interface MonthlyReportOrderItem {
  name: string;
  quantity: number;
  totalPrice: number;
}

export interface MonthlyReportOrder {
  id: string;
  orderNumber: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  tableNumber: string | null;
  tableName: string | null;
  createdByType: string;
  guestCount: number | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: MonthlyReportOrderItem[];
}

export interface MonthlyStaffPerformance {
  staffId: string | null;
  name: string;
  role: "ADMIN" | "CAPTAIN" | "CHEF" | string;
  ordersCreated: number;
  ordersAccepted: number;
  ordersPrepared: number;
  itemsPrepared: number;
  ordersServed: number;
  ordersCompleted: number;
  ordersCancelled: number;
  revenueHandled: number;
  avgPrepSeconds: number | null;
  avgServeSeconds: number | null;
}

export interface MonthlyReportStats extends DashboardKpis {
  bestDay: AnalyticsPoint | null;
  peakHour: HourPoint | null;
  channelSplit: ChannelBucket[];
  sourceSplit: SourceBucket[];
  topDishes: TopDish[];
}

export interface MonthlyReport {
  success: boolean;
  range: DashboardAnalytics["range"];
  stats: MonthlyReportStats;
  orders: MonthlyReportOrder[];
  staff: MonthlyStaffPerformance[];
}

export async function fetchMonthlyReport(month: string): Promise<MonthlyReport> {
  const { data } = await api.get('/reports/monthly', { params: { month } });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Per-staff performance screen (admin, captain, chef)               */
/* ------------------------------------------------------------------ */

export interface PerformanceReport {
  success: boolean;
  range: DashboardAnalytics["range"];
  /** The signed-in staff member's own roll-up (null before first activity). */
  me: MonthlyStaffPerformance | null;
  /** Whole-team roll-up; the screen narrows it by the viewer's role. */
  staff: MonthlyStaffPerformance[];
}

export async function fetchPerformanceReport(
  month: string,
): Promise<PerformanceReport> {
  const { data } = await api.get('/reports/performance', { params: { month } });
  return data;
}