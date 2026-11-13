import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchDashboardAnalytics,
  fetchMonthlyReport,
  fetchPerformanceReport,
  type DashboardAnalytics,
  type MonthlyReport,
  type PerformanceReport,
} from "../api/reportsApi";

export const reportsKeys = {
  analytics: (month: string) => ["reports-analytics", month] as const,
  monthly: (month: string) => ["reports-monthly", month] as const,
  performance: (month: string) => ["reports-performance", month] as const,
};

/**
 * Aggregated dashboard analytics for a calendar month (sales trend, order
 * sources, top dishes, hourly revenue). Polls so live order mutations stay
 * reflected on the home screen.
 */
export function useDashboardAnalytics(month?: string, enabled = true) {
  return useQuery({
    queryKey: reportsKeys.analytics(month ?? "current"),
    queryFn: async (): Promise<DashboardAnalytics> =>
      fetchDashboardAnalytics(month ? { month } : { days: 30 }),
    enabled,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Complete monthly document data (summary stats, every order with items and
 * staff performance). Loaded only when the PDF preview modal opens.
 */
export function useMonthlyReport(month: string, enabled = true) {
  return useQuery({
    queryKey: reportsKeys.monthly(month),
    queryFn: async (): Promise<MonthlyReport> => fetchMonthlyReport(month),
    enabled: enabled && Boolean(month),
    staleTime: 60_000,
  });
}

/**
 * Per-staff performance for one month: the signed-in user's own roll-up plus
 * the team leaderboard (order-trail derived, same source as the monthly report).
 */
export function usePerformanceReport(month: string, enabled = true) {
  return useQuery({
    queryKey: reportsKeys.performance(month),
    queryFn: async (): Promise<PerformanceReport> =>
      fetchPerformanceReport(month),
    enabled: enabled && Boolean(month),
    staleTime: 60_000,
  });
}
