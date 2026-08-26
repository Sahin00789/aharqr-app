import { SectionTitle } from "../../../common/ui";
import { Badge } from "../../../common/ui";
import { MOCK_DISHES, formatINR } from "../../../common/mock";

export function ChefMenuTab() {
  const categories = Array.from(
    new Set(MOCK_DISHES.map((d) => d.category))
  );

  return (
    <div className="space-y-6">

      {categories.map((category) => {
        const dishes = MOCK_DISHES.filter((d) => d.category === category);
        return (
          <section key={category} className="space-y-3">
            <SectionTitle>{category}</SectionTitle>
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900">
                        {dish.name}
                      </p>
                      {dish.isVeg && (
                        <Badge tone="green">Veg</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500">
                      {dish.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-900">
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
      })}
    </div>
  );
}
