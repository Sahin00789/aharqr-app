import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Tag, ChefHat, Leaf, Beef, Pencil, UtensilsCrossed } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  useCurrentUser,
  Button,
  Card,
  Input,
  Badge,
} from "../../../common/ui";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import { SecondaryScreen } from "../../../common/layouts/SecondaryScreen";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "../../../api/categoriesApi";
import {
  fetchRecipes,
  createRecipe,
  deleteRecipe,
  type Recipe,
} from "../../../api/recipesApi";
import {
  fetchDishes,
  createDish,
  updateDish,
  deleteDish,
  setDishAvailability,
  type Dish,
} from "../../../api/menuApi";
import { fetchIngredients, type Ingredient } from "../../../api/inventoryApi";
import toast from "react-hot-toast";

type DishView = null | "add" | { edit: Dish };

/**
 * Menu management surface. Dishes, categories and recipes are not tabs — the
 * dishes list is the main screen and categories/recipes open as dedicated
 * SecondaryScreen overlays. "Add dish" also opens as an overlay.
 */
export function AdminDishesTab() {
  useCurrentUser();
  const [dishView, setDishView] = useState<DishView>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);

  return (
    <SecondaryScreenAdapter
      title="Dishes"
      subtitle="Menu, categories & recipes"
      action={
        <Button size="sm" onClick={() => setDishView("add")}>
          <Plus size={14} /> Add dish
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs text-zinc-400">Menu structure:</span>
        <Button size="sm" variant="secondary" onClick={() => setCatOpen(true)}>
          <Tag size={14} /> Categories
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setRecipeOpen(true)}>
          <ChefHat size={14} /> Recipes
        </Button>
      </div>

      <DishList onEdit={(d) => setDishView({ edit: d })} />

      {dishView && (
        <SecondaryScreen
          title={dishView === "add" ? "Add dish" : "Edit dish"}
          onClose={() => setDishView(null)}
        >
          <DishForm
            initial={dishView === "add" ? undefined : dishView.edit}
            onSubmit={() => setDishView(null)}
          />
        </SecondaryScreen>
      )}

      {catOpen && (
        <SecondaryScreen title="Categories" onClose={() => setCatOpen(false)}>
          <CategoryScreen />
        </SecondaryScreen>
      )}

      {recipeOpen && (
        <SecondaryScreen title="Recipes" onClose={() => setRecipeOpen(false)}>
          <RecipeScreen />
        </SecondaryScreen>
      )}
    </SecondaryScreenAdapter>
  );
}

/* ------------------------------- Dishes -------------------------------- */

function DishList({ onEdit }: { onEdit: (d: Dish) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dishes"],
    queryFn: fetchDishes,
  });
  const dishes: Dish[] = data?.dishes ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-dishes"] });
  const toggleMutation = useMutation({
    mutationFn: (d: Dish) => setDishAvailability(d.id, !d.isAvailable),
    onSuccess: invalidate,
    onError: () => toast.error("Could not update availability"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDish(id),
    onSuccess: () => {
      toast.success("Dish removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove dish"),
  });

  if (isLoading) return <p className="text-sm text-zinc-400">Loading menu…</p>;

  if (isError) {
    return (
      <EmptyState title="Couldn't load menu" description="Check your connection and try again." />
    );
  }

  if (dishes.length === 0) {
    return (
      <EmptyState
        title="No dishes"
        description="Add your first dish to start building the menu."
      />
    );
  }

  const categories = Array.from(new Set(dishes.map((d) => d.category)));
  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <SectionTitle>{cat}</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {dishes
              .filter((d) => d.category === cat)
              .map((dish) => (
                <Card key={dish.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        dish.isVeg
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dish.isVeg ? <Leaf size={14} /> : <Beef size={14} />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{dish.name}</p>
                      <p className="text-xs text-zinc-400">₹{(dish.price / 100).toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={dish.isAvailable ? "green" : "zinc"}>
                      {dish.isAvailable ? "Available" : "Hidden"}
                    </Badge>
                    <Button size="sm" variant="secondary" onClick={() => onEdit(dish)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleMutation.mutate(dish)}
                      loading={toggleMutation.isPending}
                    >
                      {dish.isAvailable ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(dish.id)}
                      loading={deleteMutation.isPending}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <UtensilsCrossed size={14} /> Toggle availability or add new dishes anytime.
      </p>
    </div>
  );
}

function DishForm({
  initial,
  onSubmit,
}: {
  initial?: Dish;
  onSubmit: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price / 100) : "");
  const [isVeg, setIsVeg] = useState(initial?.isVeg ?? true);

  const createMutation = useMutation({
    mutationFn: (p: { name: string; category: string; price: number; isVeg: boolean }) =>
      createDish(p),
    onSuccess: () => {
      toast.success("Dish added");
      qc.invalidateQueries({ queryKey: ["admin-dishes"] });
      onSubmit();
    },
    onError: () => toast.error("Could not add dish"),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; name: string; category: string; price: number; isVeg: boolean }) =>
      updateDish(p.id, { name: p.name, category: p.category, price: p.price, isVeg: p.isVeg }),
    onSuccess: () => {
      toast.success("Dish updated");
      qc.invalidateQueries({ queryKey: ["admin-dishes"] });
      onSubmit();
    },
    onError: () => toast.error("Could not update dish"),
  });

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const paise = Math.round(parseFloat(price) * 100);
        if (!name.trim() || !category.trim() || !paise || paise <= 0) {
          toast.error("Name, category and a valid price are required");
          return;
        }
        const payload = { name: name.trim(), category: category.trim(), price: paise, isVeg };
        if (initial) updateMutation.mutate({ id: initial.id, ...payload });
        else createMutation.mutate(payload);
      }}
    >
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Paneer Butter Masala" />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Main" />
      <Input label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250" />
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isVeg}
          onChange={(e) => setIsVeg(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
        />
        Vegetarian
      </label>
      <div className="sm:col-span-2">
        <Button size="sm" type="submit" loading={createMutation.isPending || updateMutation.isPending}>
          {initial ? "Save changes" : "Save dish"}
        </Button>
      </div>
    </form>
  );
}

/* ----------------------------- Categories ----------------------------- */

function CategoryScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchCategories(),
  });
  const categories: Category[] = data?.categories ?? [];

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-categories"] });

  const createMutation = useMutation({
    mutationFn: (p: { name: string; type: "FOOD" | "BEVERAGE" | "OTHER"; description?: string }) =>
      createCategory(p),
    onSuccess: () => {
      toast.success("Category added");
      setAdding(false);
      invalidate();
    },
    onError: () => toast.error("Could not add category"),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; name: string; type: "FOOD" | "BEVERAGE" | "OTHER"; description?: string }) =>
      updateCategory(p.id, { name: p.name, type: p.type, description: p.description }),
    onSuccess: () => {
      toast.success("Category updated");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Could not update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove category"),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={14} /> Add category
        </Button>
      </div>

      {adding && <CategoryForm onSubmit={(p) => createMutation.mutate(p)} onCancel={() => setAdding(false)} />}
      {editing && (
        <CategoryForm
          initial={editing}
          onSubmit={(p) => updateMutation.mutate({ id: editing.id, ...p })}
          onCancel={() => setEditing(null)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : isError ? (
        <EmptyState title="Couldn't load categories" description="Try again shortly." />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories" description="Group dishes into categories like Starters, Mains, Drinks." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Tag size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-400">{c.description || c.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="zinc">{c.type}</Badge>
                <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(c.id)}
                  loading={deleteMutation.isPending}
                >
                  <X size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Category;
  onSubmit: (p: { name: string; type: "FOOD" | "BEVERAGE" | "OTHER"; description?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"FOOD" | "BEVERAGE" | "OTHER">(initial?.type ?? "FOOD");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <form
      className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          toast.error("Name is required");
          return;
        }
        onSubmit({ name: name.trim(), type, description: description.trim() || undefined });
      }}
    >
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Starters" />
      <div className="grid gap-1">
        <label className="text-xs font-medium text-zinc-600">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "FOOD" | "BEVERAGE" | "OTHER")}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="FOOD">Food</option>
          <option value="BEVERAGE">Beverage</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
      <div className="flex gap-2">
        <Button size="sm" type="submit" loading={false}>
          Save
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------ Recipes ------------------------------- */

interface IngredientRow {
  ingredientId: string;
  quantity: number;
  unit: string;
}

function RecipeScreen() {
  const qc = useQueryClient();
  const { data: recipesData } = useQuery({ queryKey: ["admin-recipes"], queryFn: () => fetchRecipes() });
  const { data: dishesData } = useQuery({ queryKey: ["admin-dishes"], queryFn: fetchDishes });
  const { data: ingredientsData } = useQuery({ queryKey: ["admin-ingredients"], queryFn: fetchIngredients });

  const recipes: Recipe[] = recipesData?.recipes ?? [];
  const dishes: Dish[] = dishesData?.dishes ?? [];
  const ingredients: Ingredient[] = ingredientsData?.ingredients ?? [];

  const [adding, setAdding] = useState(false);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-recipes"] });

  const createMutation = useMutation({
    mutationFn: (p: { dishId: string; name: string; ingredients: IngredientRow[] }) =>
      createRecipe({ dishId: p.dishId, name: p.name, ingredients: p.ingredients }),
    onSuccess: () => {
      toast.success("Recipe saved");
      setAdding(false);
      invalidate();
    },
    onError: () => toast.error("Could not save recipe"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      toast.success("Recipe removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove recipe"),
  });

  const dishName = (id: string) => dishes.find((d) => d.id === id)?.name ?? "Dish";
  const ingName = (id: string) => ingredients.find((i) => i.id === id)?.name ?? "Ingredient";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)} disabled={dishes.length === 0}>
          <Plus size={14} /> Add recipe
        </Button>
      </div>

      {adding && (
        <RecipeForm
          dishes={dishes}
          ingredients={ingredients}
          onSubmit={(p) => createMutation.mutate(p)}
          onCancel={() => setAdding(false)}
        />
      )}

      {recipes.length === 0 ? (
        <EmptyState
          title="No recipes"
          description="Attach ingredient lists to dishes so stock deducts automatically on order."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {recipes.map((r) => (
            <Card key={r.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ChefHat size={14} />
                  </span>
                  <p className="text-sm font-medium text-zinc-900">{r.name}</p>
                  <Badge tone="zinc">{dishName(r.dishId)}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(r.id)}
                  loading={deleteMutation.isPending}
                >
                  <X size={14} />
                </Button>
              </div>
              <ul className="space-y-1 pl-9 text-xs text-zinc-500">
                {r.ingredients.map((i) => (
                  <li key={i.id}>
                    {ingName(i.ingredientId)} — {i.quantity} {i.unit}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeForm({
  dishes,
  ingredients,
  onSubmit,
  onCancel,
}: {
  dishes: Dish[];
  ingredients: Ingredient[];
  onSubmit: (p: { dishId: string; name: string; ingredients: IngredientRow[] }) => void;
  onCancel: () => void;
}) {
  const [dishId, setDishId] = useState(dishes[0]?.id ?? "");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<IngredientRow[]>([
    { ingredientId: ingredients[0]?.id ?? "", quantity: 1, unit: "" },
  ]);

  const addRow = () =>
    setRows((r) => [...r, { ingredientId: ingredients[0]?.id ?? "", quantity: 1, unit: "" }]);
  const updateRow = (idx: number, patch: Partial<IngredientRow>) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));

  return (
    <form
      className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
      onSubmit={(e) => {
        e.preventDefault();
        if (!dishId) return toast.error("Select a dish");
        const clean = rows.filter((r) => r.ingredientId && r.quantity > 0);
        if (clean.length === 0) return toast.error("Add at least one ingredient");
        onSubmit({
          dishId,
          name: name.trim() || dishes.find((d) => d.id === dishId)?.name || "Recipe",
          ingredients: clean,
        });
      }}
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-zinc-600">Dish</label>
        <select
          value={dishId}
          onChange={(e) => setDishId(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          {dishes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <Input label="Recipe name (optional)" value={name} onChange={(e) => setName(e.target.value)} />

      <SectionTitle>Ingredients</SectionTitle>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="grid flex-1 gap-1">
              <select
                value={row.ingredientId}
                onChange={(e) => updateRow(idx, { ingredientId: e.target.value })}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              >
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Qty"
              type="number"
              value={String(row.quantity)}
              onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
              className="w-20"
            />
            <Input
              label="Unit"
              value={row.unit}
              onChange={(e) => updateRow(idx, { unit: e.target.value })}
              placeholder="g"
              className="w-20"
            />
            <Button size="sm" variant="ghost" type="button" onClick={() => removeRow(idx)}>
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="button" variant="secondary" onClick={addRow}>
          <Plus size={14} /> Add ingredient
        </Button>
        <Button size="sm" type="submit">
          Save recipe
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
