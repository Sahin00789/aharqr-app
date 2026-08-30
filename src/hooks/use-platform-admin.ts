import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlatformAdmin,
  deletePlatformAdmin,
  getPlatformAdminMe,
  listPlatformAdmins,
  updatePlatformAdmin,
} from "../services/platform-admin.services";
import type {
  CreatePlatformAdminInput,
  UpdatePlatformAdminInput,
} from "../services/platform-admin.services";

export const platformAdminKeys = {
  all: ["platform-admins"] as const,
  list: () => [...platformAdminKeys.all, "list"] as const,
  me: () => [...platformAdminKeys.all, "me"] as const,
};

export function usePlatformAdmins() {
  return useQuery({
    queryKey: platformAdminKeys.list(),
    queryFn: async () => {
      const res = await listPlatformAdmins();
      return res.platformAdmins;
    },
  });
}

export function usePlatformAdminMe(enabled = true) {
  return useQuery({
    queryKey: platformAdminKeys.me(),
    queryFn: async () => {
      const res = await getPlatformAdminMe();
      return res.platformAdmin;
    },
    enabled,
  });
}

export function useCreatePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformAdminInput) =>
      createPlatformAdmin(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformAdminKeys.all });
    },
  });
}

export function useUpdatePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePlatformAdminInput;
    }) => updatePlatformAdmin(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformAdminKeys.all });
    },
  });
}

export function useDeletePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformAdmin(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformAdminKeys.all });
    },
  });
}