import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyRestaurant,
  getRestaurantActiveSessions,
  getRestaurantStaff,
  updateMyRestaurant,
} from "../services/restaurant.services";
import type { UpdateMyRestaurantInput } from "../services/restaurant.services";

export const restaurantKeys = {
  all: ["restaurant"] as const,
  detail: () => [...restaurantKeys.all, "detail"] as const,
  staff: () => [...restaurantKeys.all, "staff"] as const,
  activeSessions: () => [...restaurantKeys.all, "active-sessions"] as const,
};

export function useMyRestaurant() {
  return useQuery({
    queryKey: restaurantKeys.detail(),
    queryFn: getMyRestaurant,
  });
}

export function useUpdateMyRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMyRestaurantInput) => updateMyRestaurant(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
    },
  });
}

export function useRestaurantStaff() {
  return useQuery({
    queryKey: restaurantKeys.staff(),
    queryFn: getRestaurantStaff,
  });
}

export function useRestaurantActiveSessions() {
  return useQuery({
    queryKey: restaurantKeys.activeSessions(),
    queryFn: getRestaurantActiveSessions,
  });
}