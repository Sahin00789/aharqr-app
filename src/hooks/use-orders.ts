import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrderTrails,
  fetchOrders,
  recordOrderPayment,
  rollbackOrder,
  updateOrderStatus,
  addOrderItems,
  type OrderTrail,
  type PaymentMethod,
  type StaffOrder,
} from "../api/ordersApi";
import {
  getGuestOrders,
  type GuestOrder,
  type GuestTaxConfig,
} from "../services/menu.service";

/** Single source of truth for order-related query keys. */
export const orderKeys = {
  staff: ["staff-orders"] as const,
  guest: ["guest-orders"] as const,
  trails: (orderId: string) => ["order-trails", orderId] as const,
};

/** Staff order feed shared by admin / captain / chef. */
export function useStaffOrders() {
  return useQuery({
    queryKey: orderKeys.staff,
    queryFn: async (): Promise<StaffOrder[]> => (await fetchOrders()).orders ?? [],
  });
}

/** Immutable lifecycle trail for a single order (order-level + per-item rows). */
export function useOrderTrails(
  orderId: string | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: orderKeys.trails(orderId ?? ""),
    queryFn: async (): Promise<OrderTrail[]> =>
      (await fetchOrderTrails(orderId as string)).trails ?? [],
    enabled: enabled && Boolean(orderId),
  });
}

export interface UpdateOrderStatusInput {
  id: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  status: string;
}

export function useUpdateOrderStatus(opts?: {
  onSuccess?: (input: UpdateOrderStatusInput) => void;
  onError?: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) =>
      updateOrderStatus(input.id, input.orderType, input.status),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.staff });
      void queryClient.invalidateQueries({ queryKey: orderKeys.guest });
      opts?.onSuccess?.(input);
    },
    onError: () => opts?.onError?.(),
  });
}

export interface RollbackOrderInput {
  id: string;
  orderType: "DINE_IN" | "TAKEAWAY";
}

/** Undo the last order status change (one step back). */
export function useRollbackOrder(opts?: {
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RollbackOrderInput) =>
      rollbackOrder(input.id, input.orderType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.staff });
      void queryClient.invalidateQueries({ queryKey: orderKeys.guest });
      opts?.onSuccess?.();
    },
    onError: () => opts?.onError?.(),
  });
}

export interface AddOrderItemsInput {
  id: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  items: { menuId: string; quantity: number }[];
}

/** Append dishes to an existing order (admin / captain). */
export function useAddOrderItems(opts?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddOrderItemsInput) =>
      addOrderItems(input.id, input.orderType, input.items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.staff });
      void queryClient.invalidateQueries({ queryKey: orderKeys.guest });
      opts?.onSuccess?.();
    },
    onError: (error: unknown) => {
      opts?.onError?.(error);
    },
  });
}

export interface RecordOrderPaymentInput {
  id: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  method: PaymentMethod;
}

/** Record customer payment on an approved order (admin / captain only). */
export function useRecordOrderPayment(opts?: {
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordOrderPaymentInput) =>
      recordOrderPayment(input.id, input.orderType, input.method),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.staff });
      void queryClient.invalidateQueries({ queryKey: orderKeys.guest });
      void queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["ledger"] });
      opts?.onSuccess?.();
    },
    onError: () => opts?.onError?.(),
  });
}

/** Guest (table) order feed — polls by default for live tracking. */
export function useGuestOrders(refetchInterval?: number) {
  return useQuery({
    queryKey: orderKeys.guest,
    queryFn: async () => {
      const res = await getGuestOrders();
      return {
        orders: (res.orders ?? []) as GuestOrder[],
        tax: res.tax as GuestTaxConfig | undefined,
        tableNumber: res.tableNumber ?? "",
      };
    },
    refetchInterval,
  });
}
