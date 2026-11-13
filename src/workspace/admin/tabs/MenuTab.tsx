import { useMemo, useState } from "react";
import { Search, UtensilsCrossed, X } from "lucide-react";
import {
  Badge,
  Card,
  DashboardTabSkeleton,
  EmptyState,
  SectionTitle,
  Toggle,
  TrendChip,
} from "../../../common/components";
import {
  useDishes,
  useDishSalesStats,
  useToggleDishAvailability,
} from "../../../hooks/use-menu";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

/** Admin menu preview — dishes grouped by category with today's sales. */
export function AdminMenuTab() {
  const { data, isLoading, isError } = useDishes();
  const { data: sales } = useDishSalesStats();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");

  const dishes = useMemo(() => data ?? [], [data]);
  const stats = useMemo(
    () => new Map((sales?.stats ?? []).map((s) => [s.dishId, s])),
    [sales],
  );
  const toggle = useToggleDishAvailability();

  const categories = useMemo(
    () => Array.from(new Set(dishes.map((d) => d.category))),
    [dishes],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return dishes.filter(
      (d) =>
        (category === "ALL" || d.category === category) &&
        (!needle ||
          d.name.toLowerCase().includes(needle) ||
          (d.description ?? "").toLowerCase().includes(needle)),
    );
  }, [dishes, category, search]);

  if (isLoading) {
    return <DashboardTabSkeleton label="Loading menu" variant="menu" />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn't load menu"
        description="Check your connection and try again."
      />
    );
  }

  if (dishes.length === 0) {
    return (
      <EmptyState
        title="No dishes yet"
        description="Add your first dish from Settings → Dishes to start building the menu."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + category chips */}
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
        <div className="relative w-full shrink-0 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes"
            className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pr-9 pl-9 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="no-scrollbar flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto sm:flex-1">
          {["ALL", ...categories].map((cat) => {
            const active = category === cat;
            const count =
              cat === "ALL"
                ? dishes.length
                : dishes.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition ${
                  active
                    ? "bg-accent-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat === "ALL" ? "All dishes" : cat}
                <span
                  className={`rounded px-1 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching dishes"
          description="Try another search term or category."
        />
      ) : (
        categories
          .filter((cat) =>
            filtered.some((d) => d.category === cat),
          )
          .map((cat) => (
            <div key={cat} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <SectionTitle>{cat}</SectionTitle>
                <span className="text-[11px] font-medium text-zinc-400">
                  {filtered.filter((d) => d.category === cat).length} dishes
                </span>
              </div>
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered
                  .filter((d) => d.category === cat)
                  .map((dish) => {
                    const stat = stats.get(dish.id);
                    return (
                      <Card
                        key={dish.id}
                        className={`flex items-center gap-3 !p-3 transition hover:shadow-md ${
                          dish.isAvailable ? "" : "opacity-70"
                        }`}
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-zinc-400">
                              <UtensilsCrossed size={20} />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                                dish.isVeg ? "border-emerald-600" : "border-red-600"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  dish.isVeg ? "bg-emerald-600" : "bg-red-600"
                                }`}
                              />
                            </span>
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {dish.name}
                            </p>
                          </div>
                          {dish.description && (
                            <p className="mt-0.5 truncate text-xs text-zinc-500">
                              {dish.description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                              {formatINR(dish.price)}
                            </span>
                            {!dish.isAvailable && <Badge tone="zinc">Hidden</Badge>}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                              Today
                            </span>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {stat?.soldToday ?? 0}
                            </span>
                            <TrendChip delta={stat?.delta ?? 0} />
                          </div>
                          <Toggle
                            checked={dish.isAvailable}
                            onChange={() => toggle.mutate(dish)}
                            label={dish.isAvailable ? "Hide dish" : "Show dish"}
                          />
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))
      )}

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-400">
        <UtensilsCrossed size={14} className="mt-0.5 shrink-0" />
        Toggle availability here — dishes, prices and categories are managed
        under Settings → Dishes.
      </p>
    </div>
  );
}
