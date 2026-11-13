import { useQuery } from "@tanstack/react-query";
import { getMyRestaurant } from "../services/restaurant.services";

/** Restaurant profile (shared cache with the workspace layout). */
export function useMyRestaurant() {
  return useQuery({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
    staleTime: 5 * 60_000,
  });
}
