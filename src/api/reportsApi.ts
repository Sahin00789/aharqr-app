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