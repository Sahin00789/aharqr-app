import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCaptain,
  deleteCaptain,
  getCaptainMe,
  listCaptains,
  updateCaptain,
} from "../services/captain.services";
import type {
  CreateCaptainInput,
  UpdateCaptainInput,
} from "../services/captain.services";

export const captainKeys = {
  all: ["captains"] as const,
  list: () => [...captainKeys.all, "list"] as const,
  me: () => [...captainKeys.all, "me"] as const,
};

export function useCaptains() {
  return useQuery({
    queryKey: captainKeys.list(),
    queryFn: async () => {
      const res = await listCaptains();
      return res.captains;
    },
  });
}

export function useCaptainMe(enabled = true) {
  return useQuery({
    queryKey: captainKeys.me(),
    queryFn: async () => {
      const res = await getCaptainMe();
      return res.captain;
    },
    enabled,
  });
}

export function useCreateCaptain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCaptainInput) => createCaptain(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: captainKeys.all });
    },
  });
}

export function useUpdateCaptain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCaptainInput;
    }) => updateCaptain(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: captainKeys.all });
    },
  });
}

export function useDeleteCaptain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCaptain(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: captainKeys.all });
    },
  });
}