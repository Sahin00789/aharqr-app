import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchPaymentAnalytics,
  type PaymentAnalytics,
} from "../api/financeApi";

export const financeKeys = {
  summary: ["finance-summary"] as const,
  payments: (month: string) => ["finance-payments", month] as const,
};

/**
 * Monthly payment analytics for the finance tab — successful orders, items,
 * money collected by method and the daily series. Polls so payments taken on
 * the orders screen show up without a manual refresh.
 */
export function usePaymentAnalytics(month?: string) {
  return useQuery({
    queryKey: financeKeys.payments(month ?? "current"),
    queryFn: async (): Promise<PaymentAnalytics> =>
      fetchPaymentAnalytics(month),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}
