import { Armchair, QrCode, Users } from "lucide-react";
import {
  SectionTitle,
  StatCard,
  EmptyState,
  DashboardTabSkeleton,
} from "../../../common/components";
import { Card, Badge } from "../../../common/components";
import { useRestaurantTables } from "../../../hooks/use-tables";

/** Live floor view for captains — reads tables straight from the backend. */
export function CaptainTablesTab() {
  const { data: tables = [], isLoading, isError } = useRestaurantTables();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <DashboardTabSkeleton label="Loading tables" variant="tables" />
      ) : isError ? (
        <EmptyState
          title="Couldn't load tables"
          description="Check your connection and try again."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
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
              description="Ask an admin to add tables and generate QR stickers."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
    </div>
  );
}
