import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Leaf, UtensilsCrossed } from "lucide-react";
import {
  SectionTitle,
  EmptyState,
  DashboardTabSkeleton,
} from "../../../common/components";
import { Card, Badge } from "../../../common/components";
import { fetchDishes, type Dish } from "../../../api/menuApi";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

/** Captain menu view — reads the live dish list from the backend. */
export function CaptainMenuTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["captain-dishes"],
    queryFn: fetchDishes,
  });
  const dishes = useMemo<Dish[]>(() => data?.dishes ?? [], [data]);

  const groups = useMemo(() => {
    const map = new Map<string, Dish[]>();
    for (const d of dishes) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return Array.from(map.entries());
  }, [dishes]);

  if (isLoading) {
    return <DashboardTabSkeleton label="Loading menu" variant="menu" />;
  }

  return (
    <div className="space-y-4">
      {isError ? (
        <EmptyState
          title="Couldn't load menu"
          description="Check your connection and try again."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No dishes"
          description="The menu is empty. Ask an admin to add dishes."
        />
      ) : (
        groups.map(([category, items]) => (
          <div key={category} className="space-y-3">
            <SectionTitle>{category}</SectionTitle>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {items.map((d) => (
                <Card key={d.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-medium text-zinc-900">
                        {d.isVeg ? (
                          <Leaf className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-red-500" />
                        )}
                        {d.name}
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">{category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-zinc-900">
                        {formatINR(d.price)}
                      </div>
                      <Badge tone={d.isAvailable ? "green" : "red"}>
                        {d.isAvailable ? "Available" : "Out of stock"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <UtensilsCrossed size={14} /> Live menu — managed by your admin.
      </p>
    </div>
  );
}
