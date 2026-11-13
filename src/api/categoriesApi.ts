import api from './client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export async function fetchCategories(): Promise<{ success: boolean; categories: Category[] }> {
  const { data } = await api.get('/categories');
  return data;
}

export async function createCategory(payload: {
  name: string;
  description?: string;
  displayOrder?: number;
}): Promise<{ success: boolean; category: Category }> {
  const { data } = await api.post('/categories', payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: Partial<{
    name: string;
    description?: string;
    displayOrder: number;
  }>,
): Promise<{ success: boolean; category: Category }> {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}
