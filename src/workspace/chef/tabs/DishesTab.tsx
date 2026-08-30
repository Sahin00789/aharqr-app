import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UtensilsCrossed, Eye, EyeOff } from "lucide-react";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  SectionTitle,
  StatCard,
} from "../../../common/ui";
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
  const dishes: Dish[] = data?.dishes ?? [];

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

  const stats = useMemo(
    () => [
      { label: "Total", value: dishes.length },
      { label: "Available", value: dishes.filter((d) => d.isAvailable).length },
      { label: "Unavailable", value: dishes.filter((d) => !d.isAvailable).length },
    ],
    [dishes]
  );

  if (isLoading) return <p className="text-sm text-zinc-400">Loading dishes…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <SectionTitle>
          <span className="inline-flex items-center gap-2">
            <UtensilsCrossed size={16} /> Dishes
          </span>
        </SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-accent-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <EmptyState title="Couldn't load dishes" description="Try again shortly." />
      ) : visible.length === 0 ? (
        <EmptyState title="No dishes" description="No dishes match this filter." />
      ) : (
        <div className="space-y-3">
          {visible.map((d) => (
            <Card key={d.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {d.name}
                    {d.isVeg ? (
                      <Badge tone="green">Veg</Badge>
                    ) : (
                      <Badge tone="red">Non-veg</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {d.category} · {inr(d.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={d.isAvailable ? "secondary" : "primary"}
                  onClick={() => toggle.mutate(d)}
                  disabled={toggle.isPending}
                >
                  {d.isAvailable ? (
                    <>
                      <EyeOff className="mr-1 h-4 w-4" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-4 w-4" /> Show
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
