import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHoliday,
  deleteHoliday,
  fetchHolidays,
  fetchStaffShiftConfig,
  getAdminMe,
  getRoster,
  updateStaffShiftConfig,
} from "../services/restaurant-admin.services";
import type {
  UpdateStaffShiftConfigInput,
} from "../services/restaurant-admin.services";

export const restaurantAdminKeys = {
  all: ["restaurant-admin"] as const,
  roster: () => [...restaurantAdminKeys.all, "roster"] as const,
  me: () => [...restaurantAdminKeys.all, "me"] as const,
  shiftConfig: (staffId: string) =>
    [...restaurantAdminKeys.all, "shift-config", staffId] as const,
  holidays: () => [...restaurantAdminKeys.all, "holidays"] as const,
};

export function useRoster() {
  return useQuery({
    queryKey: restaurantAdminKeys.roster(),
    queryFn: getRoster,
  });
}

export function useAdminMe(enabled = true) {
  return useQuery({
    queryKey: restaurantAdminKeys.me(),
    queryFn: async () => {
      const res = await getAdminMe();
      return res.admin;
    },
    enabled,
  });
}

export function useStaffShiftConfig(staffId: string) {
  return useQuery({
    queryKey: restaurantAdminKeys.shiftConfig(staffId),
    queryFn: async () => {
      const res = await fetchStaffShiftConfig(staffId);
      return res.configs;
    },
    enabled: !!staffId,
  });
}

export function useUpdateStaffShiftConfig(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStaffShiftConfigInput) =>
      updateStaffShiftConfig(staffId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: restaurantAdminKeys.shiftConfig(staffId),
      });
    },
  });
}

export function useHolidays() {
  return useQuery({
    queryKey: restaurantAdminKeys.holidays(),
    queryFn: async () => {
      const res = await fetchHolidays();
      return res.holidays;
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createHoliday>[0]) =>
      createHoliday(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantAdminKeys.holidays() });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHoliday(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantAdminKeys.holidays() });
    },
  });
}