import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertTriangle, XCircle, Boxes } from "lucide-react";
import { Card, Badge, EmptyState, SectionTitle, StatCard } from "../../../common/ui";
import { fetchCurrentInventory, type Ingredient } from "../../../api/inventoryApi";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "HEALTHY", label: "Current" },
  { key: "LOW_STOCK", label: "Low" },
  { key: "OUT_OF_STOCK", label: "Out" },
] as const;

const TONE: Record<string, "green" | "amber" | "red" | "zinc"> = {
  HEALTHY: "green",
  LOW_STOCK: "amber",
  OUT_OF_STOCK: "red",
};

function num(v: number | undefined): string {
  return (v ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function ChefStockTab() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chef-stock"],
    queryFn: fetchCurrentInventory,
  });
  const items: Ingredient[] = data?.inventory ?? [];

  const visible = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((i) => i.stockStatus === filter);
  }, [items, filter]);

  const stats = useMemo(
    () => [
      { label: "Total", value: items.length },
      { label: "Low stock", value: items.filter((i) => i.stockStatus === "LOW_STOCK").length },
      {
        label: "Out of stock",
        value: items.filter((i) => i.stockStatus === "OUT_OF_STOCK").length,
      },
    ],
    [items]
  );

  if (isLoading) return <p className="text-sm text-zinc-400">Loading stock…</p>;

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
            <Boxes size={16} /> Stock
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
        <EmptyState title="Couldn't load stock" description="Try again shortly." />
      ) : visible.length === 0 ? (
        <EmptyState title="No ingredients" description="No stock matches this filter." />
      ) : (
        <div className="space-y-3">
          {visible.map((i) => (
            <Card key={i.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    <Package className="h-4 w-4 text-accent-600" />
                    {i.name}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {num(i.currentStock)} {i.defaultUnit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {i.stockStatus === "LOW_STOCK" && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  {i.stockStatus === "OUT_OF_STOCK" && (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <Badge tone={TONE[i.stockStatus ?? "HEALTHY"] ?? "zinc"}>
                    {i.stockStatus?.replace("_", " ").toLowerCase() ?? "healthy"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
