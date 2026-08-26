import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Leaf, Beef, UtensilsCrossed, X } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  useCurrentUser,
} from "../../../common/ui";
import { Button, Card, Input, Badge } from "../../../common/ui";
import { ContentHeaderAction } from "../../../common/layouts/Layout";
import { MOCK_DISHES, formatINR, type Dish } from "../../../common/mock";
import toast from "react-hot-toast";

export function AdminMenuTab() {
  useCurrentUser();
  const [dishes, setDishes] = useState<Dish[]>(MOCK_DISHES);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);

  const categories = Array.from(new Set(dishes.map((d) => d.category)));

  function toggleAvailability(id: string) {
    setDishes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isAvailable: !d.isAvailable } : d
      )
    );
    const dish = dishes.find((d) => d.id === id);
    toast.success(
      dish?.isAvailable ? `${dish.name} marked unavailable` : `${dish?.name} available`
    );
  }

  function addDish() {
    if (!name.trim() || !category.trim() || !price.trim()) {
      toast.error("Name, category and price are required");
      return;
    }
    const paise = Math.round(parseFloat(price) * 100);
    if (Number.isNaN(paise) || paise <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    const dish: Dish = {
      id: `d${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price: paise,
      isVeg,
      isAvailable: true,
      stock: 0,
    };
    setDishes((prev) => [dish, ...prev]);
    toast.success(`Added ${dish.name}`);
    setName("");
    setCategory("");
    setPrice("");
    setIsVeg(true);
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      <ContentHeaderAction>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add dish
        </Button>
      </ContentHeaderAction>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add dish">
        <div className="grid gap-3 sm:grid-cols-2">
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
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            Vegetarian
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" onClick={addDish}>
            Save dish
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {dishes.length === 0 ? (
        <EmptyState
          title="No dishes"
          description="Add your first dish to start building the menu."
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
                          {formatINR(dish.price)} · stock {dish.stock}
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
                        onClick={() => toggleAvailability(dish.id)}
                      >
                        {dish.isAvailable ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <UtensilsCrossed size={14} /> Toggle availability or add new dishes
        anytime.
      </p>
    </div>
  );
}

/** Lightweight centered dialog: backdrop + animated card, closes on Escape/backdrop. */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 h-[100dvh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
