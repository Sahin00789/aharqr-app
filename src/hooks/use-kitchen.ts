import { useQuery } from "@tanstack/react-query";
import {
  fetchKitchenPrepReport,
  type KitchenPrepReport,
} from "../api/kitchenApi";

/** Single source of truth for kitchen-related query keys. */
export const kitchenKeys = {
  orders: ["kitchen-orders"] as const,
  prepReport: (from?: string, to?: string) =>
    ["kitchen", "prep-report", from ?? "", to ?? ""] as const,
};

/** Dishes accepted for cooking in a date window with prep-time stats. */
export function useKitchenPrepReport(from?: string, to?: string) {
  return useQuery({
    queryKey: kitchenKeys.prepReport(from, to),
    queryFn: async (): Promise<KitchenPrepReport> =>
      fetchKitchenPrepReport(from, to),
    staleTime: 30_000,
  });
}