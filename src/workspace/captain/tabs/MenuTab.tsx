import { useMemo } from "react";
import { Leaf } from "lucide-react";
import { SectionTitle, EmptyState } from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import { MOCK_DISHES, formatINR } from "../../../common/mock";

export function CaptainMenuTab() {
  const groups = useMemo(() => {
    const map = new Map<string, typeof MOCK_DISHES>();
    for (const d of MOCK_DISHES) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="space-y-6">

      {groups.length === 0 ? (
        <EmptyState title="No dishes" description="The menu is empty." />
      ) : (
        groups.map(([category, dishes]) => (
          <div key={category} className="space-y-3">
            <SectionTitle>{category}</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dishes.map((d) => (
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
                      <div className="font-semibold text-zinc-900">{formatINR(d.price)}</div>
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
    </div>
  );
}
