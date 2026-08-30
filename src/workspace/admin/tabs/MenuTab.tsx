import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Leaf, Plus, Beef, UtensilsCrossed, X } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Button, Card, Input, Badge, Modal } from "../../../common/ui";
import { ContentHeaderAction } from "../../../common/layouts/Layout";
import {
  createDish,
  deleteDish,
  fetchDishes,
  setDishAvailability,
  updateDish,
  type Dish,
} from "../../../api/menuApi";
import toast from "react-hot-toast";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

/** Admin menu management — backed by the live dishes module. */
export function AdminMenuTab() {
  useCurrentUser();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dishes"],
    queryFn: fetchDishes,
  });
  const dishes: Dish[] = data?.dishes ?? [];

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-dishes"] });

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      category: string;
      price: number;
      isVeg: boolean;
    }) => createDish(payload),
    onSuccess: () => {
      toast.success("Dish added");
      setAdding(false);
      invalidate();
    },
    onError: () => toast.error("Could not add dish"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; name: string; category: string; price: number; isVeg: boolean }) =>
      updateDish(payload.id, {
        name: payload.name,
        category: payload.category,
        price: payload.price,
        isVeg: payload.isVeg,
      }),
    onSuccess: () => {
      toast.success("Dish updated");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Could not update dish"),
  });

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

  const categories = Array.from(new Set(dishes.map((d) => d.category)));

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading menu…</p>;
  }

  return (
    <div className="space-y-6">
      <ContentHeaderAction>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add dish
        </Button>
      </ContentHeaderAction>

      {isError ? (
        <EmptyState
          title="Couldn't load menu"
          description="Check your connection and try again."
        />
      ) : (
        <>
          {dishes.length === 0 ? (
            <EmptyState
              title="No dishes"
              description="Add your first dish to start building the menu."
              action={
                <Button size="sm" onClick={() => setAdding(true)}>
                  <Plus size={14} /> Add dish
                </Button>
              }
            />
          ) : (
            categories.map((cat) => (
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
                            <p className="text-sm font-medium text-zinc-900">
                              {dish.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {formatINR(dish.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={dish.isAvailable ? "green" : "zinc"}>
                            {dish.isAvailable ? "Available" : "Hidden"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditing(dish)}
                          >
                            Edit
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
            ))
          )}
        </>
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <UtensilsCrossed size={14} /> Toggle availability or add new dishes
        anytime.
      </p>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add dish"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              form="add-dish-form"
              type="submit"
              loading={createMutation.isPending}
            >
              Save dish
            </Button>
          </>
        }
      >
        <DishForm onSubmit={(p) => createMutation.mutate(p)} />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit dish"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              form="edit-dish-form"
              type="submit"
              loading={updateMutation.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <DishForm
            initial={editing}
            onSubmit={(p) =>
              updateMutation.mutate({
                id: editing.id,
                name: p.name,
                category: p.category,
                price: p.price,
                isVeg: p.isVeg,
              })
            }
          />
        )}
      </Modal>
    </div>
  );
}

function DishForm({
  initial,
  onSubmit,
}: {
  initial?: Dish;
  onSubmit: (payload: {
    name: string;
    category: string;
    price: number;
    isVeg: boolean;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(
    initial ? String(initial.price / 100) : "",
  );
  const [isVeg, setIsVeg] = useState(initial?.isVeg ?? true);

  return (
    <form
      id={initial ? "edit-dish-form" : "add-dish-form"}
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const paise = Math.round(parseFloat(price) * 100);
        if (!name.trim() || !category.trim() || !paise || paise <= 0) {
          toast.error("Name, category and a valid price are required");
          return;
        }
        onSubmit({
          name: name.trim(),
          category: category.trim(),
          price: paise,
          isVeg,
        });
      }}
    >
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Paneer Butter Masala"
      />
      <Input
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Main"
      />
      <Input
        label="Price (₹)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="250"
      />
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isVeg}
          onChange={(e) => setIsVeg(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
        />
        Vegetarian
      </label>
    </form>
  );
}
