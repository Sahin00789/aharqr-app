import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DashboardTabSkeleton,
  EmptyState,
  SectionTitle,
  StatCard,
} from "../../../common/components";
import {
  fetchDishes,
  setDishAvailability,
  type Dish,
} from "../../../api/menuApi";
import toast from "react-hot-toast";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "AVAILABLE", label: "Available" },
  { key: "UNAVAILABLE", label: "Unavailable" },
] as const;

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function ChefDishesTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chef-dishes"],
    queryFn: fetchDishes,
  });
  const dishes = useMemo<Dish[]>(() => data?.dishes ?? [], [data]);

  const toggle = useMutation({
    mutationFn: (d: Dish) => setDishAvailability(d.id, !d.isAvailable),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chef-dishes"] });
      toast.success("Dish updated");
    },
    onError: () => toast.error("Could not update dish"),
  });

  const visible = useMemo(() => {
    if (filter === "AVAILABLE") return dishes.filter((d) => d.isAvailable);
    if (filter === "UNAVAILABLE") return dishes.filter((d) => !d.isAvailable);
    return dishes;
  }, [dishes, filter]);

  const available = dishes.filter((d) => d.isAvailable).length;
  const unavailable = dishes.length - available;

  if (isLoading)
    return <DashboardTabSkeleton label="Loading dishes" variant="menu" />;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total dishes" value={dishes.length} hint="On the menu" />
        <StatCard
          label="Available"
          value={available}
          tone="green"
          hint="Orderable now"
        />
        <StatCard
          label="Unavailable"
          value={unavailable}
          tone={unavailable > 0 ? "amber" : "default"}
          hint="Hidden from guests"
        />
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle>Menu availability</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count =
              f.key === "ALL"
                ? dishes.length
                : f.key === "AVAILABLE"
                  ? available
                  : unavailable;
            const selected = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                  selected
                    ? "bg-accent-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                }`}
              >
                {f.label}
                <span
                  className={`rounded px-1 text-[10px] ${
                    selected
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

      {isError ? (
        <EmptyState
          title="Couldn't load dishes"
          description="Try again shortly."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No dishes"
          description="No dishes match this filter."
        />
      ) : (
        <div className="grid items-start gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visible.map((d) => (
            <Card
              key={d.id}
              className={`flex items-center gap-3 !p-3 ${
                d.isAvailable ? "" : "opacity-70"
              }`}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={d.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-zinc-400">
                    <UtensilsCrossed size={18} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                      d.isVeg ? "border-emerald-600" : "border-red-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        d.isVeg ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    />
                  </span>
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {d.name}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                  {d.category} · {inr(d.price)}
                </p>
                <div className="mt-1">
                  {d.isAvailable ? (
                    <Badge tone="green">Available</Badge>
                  ) : (
                    <Badge tone="zinc">Hidden</Badge>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant={d.isAvailable ? "secondary" : "primary"}
                onClick={() => toggle.mutate(d)}
                disabled={toggle.isPending}
                className="shrink-0"
              >
                {d.isAvailable ? (
                  <>
                    <EyeOff size={13} /> Hide
                  </>
                ) : (
                  <>
                    <Eye size={13} /> Show
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
