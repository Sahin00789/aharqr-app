import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAttendanceRecords,
  generateAttendanceQr,
  verifyAttendance,
} from "../services/attendance.services";
import type {
  GenerateAttendanceQrInput,
  VerifyAttendanceInput,
} from "../services/attendance.services";

export const attendanceKeys = {
  all: ["attendance"] as const,
  records: (from?: string, to?: string) =>
    [...attendanceKeys.all, "records", from ?? "", to ?? ""] as const,
};

export function useAttendanceRecords(from?: string, to?: string) {
  return useQuery({
    queryKey: attendanceKeys.records(from, to),
    queryFn: async () => {
      const res = await fetchAttendanceRecords(from, to);
      return res.records;
    },
  });
}

export function useGenerateAttendanceQr() {
  return useMutation({
    mutationFn: (input: GenerateAttendanceQrInput) =>
      generateAttendanceQr(input),
  });
}

export function useVerifyAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyAttendanceInput) => verifyAttendance(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}