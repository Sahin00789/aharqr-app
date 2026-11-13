import api from './client';

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  category: string;
  categoryId?: string | null;
  /** Stored in paise. */
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string | null;
  displayOrder?: number;
  images?: DishImage[];
}

export interface DishImage {
  id: string;
  dishId: string;
  url: string;
  displayOrder: number;
}

export interface CreateDishInput {
  name: string;
  category: string;
  categoryId?: string;
  price: number;
  isVeg?: boolean;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  displayOrder?: number;
}

export async function fetchDishes(): Promise<{ success: boolean; dishes: Dish[] }> {
  const { data } = await api.get('/dishes');
  return data;
}

export async function createDish(payload: CreateDishInput): Promise<{ success: boolean; dish: Dish }> {
  const { data } = await api.post('/dishes', payload);
  return data;
}

export async function updateDish(
  id: string,
  payload: Partial<CreateDishInput>,
): Promise<{ success: boolean; dish: Dish }> {
  const { data } = await api.put(`/dishes/${id}`, payload);
  return data;
}

export async function setDishAvailability(
  id: string,
  isAvailable: boolean,
): Promise<{ success: boolean; dish: Dish }> {
  const { data } = await api.patch(`/dishes/${id}/availability`, { isAvailable });
  return data;
}

export async function deleteDish(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/dishes/${id}`);
  return data;
}

export async function uploadDishImages(id: string, files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  const { data } = await api.post(`/dishes/${id}/images`, form);
  return data;
}

export async function removeDishImage(id: string, imageId: string) {
  const { data } = await api.delete(`/dishes/${id}/images/${imageId}`);
  return data;
}

export interface DishSalesStat {
  dishId: string;
  name: string;
  soldToday: number;
  soldYesterday: number;
  delta: number;
}

export async function fetchDishSalesStats(): Promise<{ success: boolean; stats: DishSalesStat[] }> {
  const { data } = await api.get('/internal/dish-stats');
  return data;
}