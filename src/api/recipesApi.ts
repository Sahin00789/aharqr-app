import api from './client';

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  dishId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  ingredients: RecipeIngredient[];
}

export async function fetchRecipes(
  dishId?: string,
): Promise<{ success: boolean; recipes: Recipe[] }> {
  const { data } = await api.get('/recipes', { params: dishId ? { dishId } : {} });
  return data;
}

export async function createRecipe(payload: {
  dishId: string;
  name: string;
  description?: string;
  ingredients: { ingredientId: string; quantity: number; unit: string }[];
}): Promise<{ success: boolean; recipe: Recipe }> {
  const { data } = await api.post('/recipes', payload);
  return data;
}

export async function updateRecipe(
  id: string,
  payload: {
    name?: string;
    description?: string;
    ingredients?: { ingredientId: string; quantity: number; unit: string }[];
  },
): Promise<{ success: boolean; recipe: Recipe }> {
  const { data } = await api.put(`/recipes/${id}`, payload);
  return data;
}

export async function deleteRecipe(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/recipes/${id}`);
  return data;
}
