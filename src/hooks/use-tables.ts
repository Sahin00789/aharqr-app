import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  fetchRestaurantTables,
  regenerateTableQr,
  updateRestaurantTable,
  type RestaurantTable,
} from "../api/tablesApi";

/** Shared restaurant-table list query key (single cache across all roles). */
export const tableKeys = {
  list: ["restaurant-tables"] as const,
};

export function useRestaurantTables() {
  return useQuery({
    queryKey: tableKeys.list,
    queryFn: async (): Promise<RestaurantTable[]> =>
      (await fetchRestaurantTables()).tables ?? [],
  });
}

type Hooks = { onSuccess?: () => void; onError?: () => void };

function useInvalidateTables() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tableKeys.list });
}

export function useCreateRestaurantTable(opts?: {
  onSuccess?: (isTakeaway: boolean) => void;
  onError?: () => void;
}) {
  const invalidate = useInvalidateTables();
  return useMutation({
    mutationFn: (payload: {
      tableNumber: string;
      tableName: string;
      capacity: number;
      isTakeaway?: boolean;
    }) => createRestaurantTable(payload),
    onSuccess: (_data, variables) => {
      void invalidate();
      opts?.onSuccess?.(Boolean(variables.isTakeaway));
    },
    onError: () => opts?.onError?.(),
  });
}

export function useUpdateRestaurantTable(opts?: Hooks) {
  const invalidate = useInvalidateTables();
  return useMutation({
    mutationFn: (payload: {
      id: string;
      tableNumber?: string;
      tableName?: string;
      capacity?: number;
      isActive?: boolean;
      isTakeaway?: boolean;
    }) =>
      updateRestaurantTable(payload.id, {
        tableNumber: payload.tableNumber,
        tableName: payload.tableName,
        capacity: payload.capacity,
        isActive: payload.isActive,
        isTakeaway: payload.isTakeaway,
      }),
    onSuccess: () => {
      void invalidate();
      opts?.onSuccess?.();
    },
    onError: () => opts?.onError?.(),
  });
}

export function useDeleteRestaurantTable(opts?: Hooks) {
  const invalidate = useInvalidateTables();
  return useMutation({
    mutationFn: (id: string) => deleteRestaurantTable(id),
    onSuccess: () => {
      void invalidate();
      opts?.onSuccess?.();
    },
    onError: () => opts?.onError?.(),
  });
}

export function useRegenerateTableQr(opts?: Hooks) {
  const invalidate = useInvalidateTables();
  return useMutation({
    mutationFn: (id: string) => regenerateTableQr(id),
    onSuccess: () => {
      void invalidate();
      opts?.onSuccess?.();
    },
    onError: () => opts?.onError?.(),
  });
}
