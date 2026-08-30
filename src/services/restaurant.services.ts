import { api } from "./api-client";

export interface RestaurantProfile {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email?: string | null;
  logo?: string | null;
  address?: string | null;
  state?: string | null;
  district?: string | null;
  blockMunicipality?: string | null;
  townCity?: string | null;
  villageWard?: string | null;
  locality?: string | null;
  street?: string | null;
  landmark?: string | null;
  premisesName?: string | null;
  postalCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMyRestaurantInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  state?: string;
  district?: string;
  blockMunicipality?: string;
  townCity?: string;
  villageWard?: string;
  locality?: string;
  street?: string;
  landmark?: string;
  premisesName?: string;
  postalCode?: string;
}

export interface RestaurantTeamMember {
  id: string;
  name: string;
  email: string;
  status?: string;
  [key: string]: unknown;
}

export function getMyRestaurant(): Promise<RestaurantProfile> {
  return api<{ success: boolean; restaurant: RestaurantProfile }>(
    "/api/restaurant/my-restaurant",
  ).then((data) => data.restaurant);
}

export function updateMyRestaurant(
  input: UpdateMyRestaurantInput,
): Promise<{ success: boolean; restaurant: RestaurantProfile }> {
  return api("/api/restaurant/my-restaurant", { method: "PUT", body: input });
}

export function getRestaurantStaff(): Promise<{
  success: boolean;
  captains: RestaurantTeamMember[];
  chefs: RestaurantTeamMember[];
}> {
  return api("/api/restaurant/staff");
}

export function getRestaurantActiveSessions(): Promise<{
  success: boolean;
  activeSessions: RestaurantTeamMember[];
}> {
  return api("/api/restaurant/active-sessions");
}