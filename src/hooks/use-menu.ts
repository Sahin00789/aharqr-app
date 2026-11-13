import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory,
  updateCategory,
} from "../api/categoriesApi";
import {
  fetchDishes,
  fetchDishSalesStats,
  createDish,
  updateDish,
  deleteDish,
  setDishAvailability,
  uploadDishImages,
  removeDishImage,
  type CreateDishInput,
} from "../api/menuApi";

export const menuKeys = {
  dishes: ["admin-dishes"] as const,
  categories: ["admin-categories"] as const,
};

export function useDishes() {
  return useQuery({
    queryKey: menuKeys.dishes,
    queryFn: async () => (await fetchDishes()).dishes ?? [],
  });
}

export function useDishSalesStats() {
  return useQuery({
    queryKey: ["dish-stats"],
    queryFn: fetchDishSalesStats,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: menuKeys.categories,
    queryFn: async () => (await fetchCategories()).categories ?? [],
  });
}

export interface DishMutationInput extends CreateDishInput {
  images?: File[];
}

interface DishUpdateInput extends CreateDishInput {
  id: string;
  images?: File[];
}

export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DishMutationInput) => {
      const res = await createDish(input);
      if (input.images?.length) await uploadDishImages(res.dish.id, input.images);
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}

export function useUpdateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DishUpdateInput) => {
      const { images, ...payload } = input;
      const res = await updateDish(payload.id, payload);
      if (images?.length) await uploadDishImages(payload.id, images);
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}

export function useToggleDishAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dish: { id: string; isAvailable: boolean }) =>
      setDishAvailability(dish.id, !dish.isAvailable),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}

export function useRemoveDishImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dishId, imageId }: { dishId: string; imageId: string }) =>
      removeDishImage(dishId, imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof updateCategory>[1]) =>
      updateCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.categories });
      void queryClient.invalidateQueries({ queryKey: menuKeys.dishes });
    },
  });
}