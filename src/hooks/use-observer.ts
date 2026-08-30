import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createObserver,
  deleteObserver,
  getObserverMe,
  listObservers,
  updateObserver,
} from "../services/observer.services";
import type {
  CreateObserverInput,
  UpdateObserverInput,
} from "../services/observer.services";

export const observerKeys = {
  all: ["observers"] as const,
  list: () => [...observerKeys.all, "list"] as const,
  me: () => [...observerKeys.all, "me"] as const,
};

export function useObservers() {
  return useQuery({
    queryKey: observerKeys.list(),
    queryFn: async () => {
      const res = await listObservers();
      return res.observers;
    },
  });
}

export function useObserverMe(enabled = true) {
  return useQuery({
    queryKey: observerKeys.me(),
    queryFn: async () => {
      const res = await getObserverMe();
      return res.observer;
    },
    enabled,
  });
}

export function useCreateObserver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateObserverInput) => createObserver(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observerKeys.all });
    },
  });
}

export function useUpdateObserver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateObserverInput;
    }) => updateObserver(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observerKeys.all });
    },
  });
}

export function useDeleteObserver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteObserver(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observerKeys.all });
    },
  });
}