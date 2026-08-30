import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChef,
  deleteChef,
  getChefMe,
  listChefs,
  updateChef,
} from "../services/chef.services";
import type {
  CreateChefInput,
  UpdateChefInput,
} from "../services/chef.services";

export const chefKeys = {
  all: ["chefs"] as const,
  list: () => [...chefKeys.all, "list"] as const,
  me: () => [...chefKeys.all, "me"] as const,
};

export function useChefs() {
  return useQuery({
    queryKey: chefKeys.list(),
    queryFn: async () => {
      const res = await listChefs();
      return res.chefs;
    },
  });
}

export function useChefMe(enabled = true) {
  return useQuery({
    queryKey: chefKeys.me(),
    queryFn: async () => {
      const res = await getChefMe();
      return res.chef;
    },
    enabled,
  });
}

export function useCreateChef() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChefInput) => createChef(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chefKeys.all });
    },
  });
}

export function useUpdateChef() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateChefInput;
    }) => updateChef(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chefKeys.all });
    },
  });
}

export function useDeleteChef() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChef(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chefKeys.all });
    },
  });
}