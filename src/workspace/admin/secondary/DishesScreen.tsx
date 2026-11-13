import { useState, type ReactNode } from "react";
import { useLongPress } from "../../../hooks/useLongPress";
import { Plus, X, Pencil } from "lucide-react";
import { SectionTitle, Button } from "../../../common/components";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import type { Category } from "../../../api/categoriesApi";
import type { Dish } from "../../../api/menuApi";
import { useDishes, useCategories, useDeleteDish } from "../../../hooks/use-menu";
import { DishFormModal } from "../components/DishModal";
import { AddCategoryModal, EditCategoryModal } from "../components/CategoryModals";
import toast from "react-hot-toast";

type DishView = null | "add" | { edit: Dish };

const ALL_CATEGORY = "__all__";

export function AdminDishesTab() {
  useCurrentUser();
  const [selectedCat, setSelectedCat] = useState<string>(ALL_CATEGORY);
  const [dishView, setDishView] = useState<DishView>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [catAddOpen, setCatAddOpen] = useState(false);

  return (
    <SecondaryScreenAdapter
      title="Dishes"
      subtitle="Menu & categories"
    >
      <DishWorkspace
        category={selectedCat}
        onCategoryChange={setSelectedCat}
        onAddCategory={() => setCatAddOpen(true)}
        onEditCategory={(cat) => setEditCategory(cat)}
        onEdit={(d) => setDishView({ edit: d })}
        onAddDish={() => setDishView("add")}
      />

      {dishView !== null && (
        <DishFormModal
          initial={dishView === "add" ? null : dishView.edit}
          onClose={() => setDishView(null)}
        />
      )}

      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
        />
      )}

      <AddCategoryModal
        open={catAddOpen}
        onClose={() => setCatAddOpen(false)}
      />
    </SecondaryScreenAdapter>
  );
}

/* ----------------------------- Category chips --------------------------- */

function Chip({
  active,
  label,
  count,
  onClick,
  onLongPress,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  onLongPress?: () => void;
}) {
  const pressHandlers = useLongPress({
    onShortPress: onClick,
    onLongPress,
  });

  return (
    <button
      type="button"
      {...pressHandlers}
      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition select-none ${
        active
          ? "bg-accent-600 text-white shadow-sm"
          : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-accent-300 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:ring-accent-500/50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
          active
            ? "bg-white/20 text-white"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CategoryChips({
  selected,
  onSelect,
  onAddCategory,
  onEditCategory,
}: {
  selected: string;
  onSelect: (category: string) => void;
  onAddCategory: () => void;
  onEditCategory?: (category: Category) => void;
}) {
  const categories = useCategories().data ?? [];
  const dishes = useDishes().data ?? [];

  const dishCounts = new Map<string, number>();
  dishes.forEach((d) => dishCounts.set(d.category, (dishCounts.get(d.category) ?? 0) + 1));

  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  const chipList = Array.from(
    new Set([...categories.map((c) => c.name), ...dishCounts.keys()]),
  ).map((name) => ({ name, count: dishCounts.get(name) ?? 0 }));

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip
        active={selected === ALL_CATEGORY}
        onClick={() => onSelect(ALL_CATEGORY)}
        label="All"
        count={dishes.length}
      />
      {chipList.map((chip) => (
        <Chip
          key={chip.name}
          active={selected === chip.name}
          onClick={() => onSelect(chip.name)}
          onLongPress={
            onEditCategory && categoryByName.get(chip.name)
              ? () => onEditCategory(categoryByName.get(chip.name)!)
              : undefined
          }
          label={chip.name}
          count={chip.count}
        />
      ))}
      <button
        type="button"
        onClick={onAddCategory}
        className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-500 transition hover:border-accent-400 hover:text-accent-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-accent-500 dark:hover:text-accent-400"
      >
        <Plus size={15} /> Add
      </button>
    </div>
  );
}

/* ------------------------------- Dishes panel --------------------------- */

function Panel({
  title,
  count,
  topContent,
  children,
}: {
  title: string;
  count: number;
  topContent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex h-[58vh] min-h-72 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <SectionTitle>{title}</SectionTitle>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {count}
          </span>
        </div>
      </header>
      {topContent && (
        <div className="shrink-0 border-b border-zinc-200/70 px-3 py-2 dark:border-zinc-800">
          {topContent}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">{children}</div>
    </section>
  );
}

function PanelEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="max-w-xs text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function DishWorkspace({
  category,
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  onEdit,
  onAddDish,
}: {
  category: string;
  onCategoryChange: (category: string) => void;
  onAddCategory: () => void;
  onEditCategory?: (category: Category) => void;
  onEdit: (dish: Dish) => void;
  onAddDish: () => void;
}) {
  const { data: dishes = [], isLoading: dishesLoading } = useDishes();
  const filtered =
    category === ALL_CATEGORY ? dishes : dishes.filter((d) => d.category === category);

  const deleteMutation = useDeleteDish();

  return (
    <Panel
      title="Dishes"
      count={filtered.length}
      topContent={
        <CategoryChips
          selected={category}
          onSelect={onCategoryChange}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
        />
      }
    >
      {dishesLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <PanelEmpty title="No dishes" hint="Create a dish to get started." />
          <Button size="sm" onClick={onAddDish}>
            <Plus size={14} /> Add dish
          </Button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onAddDish}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-300 p-3 text-sm font-medium text-zinc-500 transition hover:border-accent-400 hover:text-accent-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-accent-500 dark:hover:text-accent-400"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-500/15">
              <Plus size={14} />
            </span>
            Add dish
          </button>
          {filtered.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              deleteLoading={deleteMutation.isPending}
              onEdit={() => onEdit(dish)}
              onDelete={() =>
                deleteMutation.mutate(dish.id, {
                  onSuccess: () => toast.success("Dish removed"),
                  onError: () => toast.error("Could not remove dish"),
                })
              }
            />
          ))}
        </>
      )}
    </Panel>
  );
}

/* ------------------------------ Dish card ------------------------------ */

function VegMark({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 ${
        isVeg ? "border-emerald-600" : "border-red-600"
      }`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`h-2 w-2 rounded-full ${isVeg ? "bg-emerald-600" : "bg-red-600"}`}
      />
    </span>
  );
}

function DishCard({
  dish,
  deleteLoading,
  onEdit,
  onDelete,
}: {
  dish: Dish;
  deleteLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition dark:bg-zinc-900 ${
        dish.isAvailable
          ? "border-zinc-200 dark:border-zinc-800"
          : "border-zinc-200/70 opacity-75 dark:border-zinc-800/70"
      }`}
    >
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-zinc-200/70 dark:ring-zinc-700/60"
              />
            ) : (
              <VegMark isVeg={dish.isVeg} />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {dish.name}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                {dish.category}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-1.5">
            <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit dish">
              <Pencil size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              loading={deleteLoading}
              aria-label="Delete dish"
              className="hover:text-red-600 dark:hover:text-red-400"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="min-w-0">
            {dish.description ? (
              <p className="truncate text-[11px] text-zinc-500">{dish.description}</p>
            ) : (
              <span className="text-[11px] text-zinc-400 italic">No description</span>
            )}
          </div>
          <span className="ml-3 shrink-0 text-sm font-bold text-accent-600 dark:text-accent-400">
            ₹{(dish.price / 100).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
