import { api } from "./api-client";
import type { PublicUser } from "../types";

export interface RestaurantProfile {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
}

export function getMyRestaurant(): Promise<RestaurantProfile> {
  return api("/api/v1/users/me/restaurant");
}

export function updateMyRestaurant(input: {
  name?: string;
  phone?: string;
  address?: string;
}): Promise<RestaurantProfile> {
  return api("/api/v1/users/me/restaurant", { method: "PATCH", body: input });
}

/** Self-service: update the signed-in user's own profile. */
export function updateMyProfile(input: {
  firstName: string;
  lastName?: string;
  phone?: string;
}): Promise<PublicUser> {
  return api<PublicUser>("/api/v1/users/me", { method: "PATCH", body: input });
}
