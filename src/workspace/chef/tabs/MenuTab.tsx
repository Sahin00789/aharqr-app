import { useQuery } from "@tanstack/react-query";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Badge } from "../../../common/ui";
import { fetchDishes, type Dish } from "../../../api/menuApi";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

/** Chef menu reference — reads the live dish list from the backend. */
export function ChefMenuTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chef-dishes"],
    queryFn: fetchDishes,
  });
  const dishes: Dish[] = data?.dishes ?? [];

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading menu…</p>;
  }

  const categories = Array.from(new Set(dishes.map((d) => d.category)));

  return (
    <div className="space-y-6">
      {isError ? (
        <EmptyState
          title="Couldn't load menu"
          description="Check your connection and try again."
        />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No dishes"
          description="The menu is empty. Ask an admin to add dishes."
        />
      ) : (
        categories.map((category) => {
          const items = dishes.filter((d) => d.category === category);
          return (
            <section key={category} className="space-y-3">
              <SectionTitle>{category}</SectionTitle>
              <div className="space-y-3">
                {items.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {dish.name}
                        </p>
                        {dish.isVeg && <Badge tone="green">Veg</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500">
                        {dish.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatINR(dish.price)}
                      </span>
                      <Badge tone={dish.isAvailable ? "green" : "red"}>
                        {dish.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
