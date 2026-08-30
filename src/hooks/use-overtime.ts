import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOvertime,
  fetchOvertime,
  getOvertimeCheckInQr,
  getOvertimeCheckOutQr,
  verifyOvertimeCheckInQr,
  verifyOvertimeCheckOutQr,
} from "../services/overtime.services";
import type {
  CreateOvertimeInput,
  OvertimeStatus,
} from "../services/overtime.services";

export const overtimeKeys = {
  all: ["overtime"] as const,
  list: (status?: OvertimeStatus) =>
    [...overtimeKeys.all, "list", status ?? ""] as const,
};

export function useOvertime(status?: OvertimeStatus) {
  return useQuery({
    queryKey: overtimeKeys.list(status),
    queryFn: async () => {
      const res = await fetchOvertime(status);
      return res.records;
    },
  });
}

export function useCreateOvertime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOvertimeInput) => createOvertime(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
    },
  });
}

export function useGetOvertimeCheckInQr() {
  return useMutation({
    mutationFn: (overtimeId?: string) => getOvertimeCheckInQr(overtimeId),
  });
}

export function useGetOvertimeCheckOutQr() {
  return useMutation({
    mutationFn: (overtimeId?: string) => getOvertimeCheckOutQr(overtimeId),
  });
}

export function useVerifyOvertimeCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verifyOvertimeCheckInQr(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
    },
  });
}

export function useVerifyOvertimeCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verifyOvertimeCheckOutQr(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
    },
  });
}