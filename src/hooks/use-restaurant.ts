import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyRestaurant,
  getRestaurantActiveSessions,
  getRestaurantStaff,
  updateMyRestaurant,
} from "../services/restaurant.services";
import type {
  RestaurantProfile,
  UpdateMyRestaurantInput,
} from "../services/restaurant.services";

export const restaurantKeys = {
  all: ["restaurant"] as const,
  /** Shared with the dashboard layout / profile menu cache. */
  detail: () => ["my-restaurant"] as const,
  staff: () => [...restaurantKeys.all, "staff"] as const,
  activeSessions: () => [...restaurantKeys.all, "active-sessions"] as const,
};

/** Single-line address for documents (skips empty parts). */
export function formatRestaurantAddress(
  restaurant: Partial<RestaurantProfile>,
): string {
  return [
    restaurant.premisesName,
    restaurant.street,
    restaurant.locality,
    restaurant.townCity,
    restaurant.district,
    restaurant.state,
    restaurant.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function useMyRestaurant(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: restaurantKeys.detail(),
    queryFn: getMyRestaurant,
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateMyRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMyRestaurantInput) => updateMyRestaurant(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.detail() });
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