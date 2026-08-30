import { useQuery } from "@tanstack/react-query";
import { Armchair, QrCode, Users } from "lucide-react";
import { SectionTitle, StatCard, EmptyState } from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import {
  fetchRestaurantTables,
  type RestaurantTable,
} from "../../../api/tablesApi";

/** Observer read-only floor view — backend tables, no actions. */
export function ObserverTablesTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["observer-tables"],
    queryFn: fetchRestaurantTables,
  });
  const tables: RestaurantTable[] = data?.tables ?? [];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading tables…</p>
      ) : isError ? (
        <EmptyState
          title="Couldn't load tables"
          description="Check your connection and try again."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={tables.length} />
            <StatCard
              label="Active"
              value={tables.filter((t) => t.isActive).length}
            />
            <StatCard
              label="Hidden"
              value={tables.filter((t) => !t.isActive).length}
            />
            <StatCard
              label="Seats"
              value={tables.reduce((sum, t) => sum + t.capacity, 0)}
            />
          </div>

          <SectionTitle>Tables</SectionTitle>

          {tables.length === 0 ? (
            <EmptyState
              title="No tables yet"
              description="Floor tables will appear here once added."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tables.map((t) => (
                <Card key={t.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                        <Armchair className="h-5 w-5 text-accent-600" />
                        {t.tableName || `Table ${t.tableNumber}`}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
                        <span>#{t.tableNumber}</span>
                        <span className="flex items-center gap-1">
                          <QrCode className="h-4 w-4" /> v{t.qrVersion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {t.capacity} seats
                        </span>
                      </div>
                    </div>
                    <Badge tone={t.isActive ? "green" : "zinc"}>
                      {t.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && (
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Users size={14} /> Observer view — floor is display only.
        </p>
      )}
    </div>
  );
}
