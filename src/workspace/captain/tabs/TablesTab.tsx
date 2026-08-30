import { useQuery } from "@tanstack/react-query";
import { Armchair, Download, QrCode, Users } from "lucide-react";
import { SectionTitle, StatCard, EmptyState } from "../../../common/ui";
import { Button, Card, Badge } from "../../../common/ui";
import { ContentHeaderAction } from "../../../common/layouts/Layout";
import {
  downloadTableQrPdf,
  fetchRestaurantTables,
  type RestaurantTable,
} from "../../../api/tablesApi";

/** Live floor view for captains — reads tables straight from the backend. */
export function CaptainTablesTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["captain-tables"],
    queryFn: fetchRestaurantTables,
  });
  const tables: RestaurantTable[] = data?.tables ?? [];

  function downloadAll() {
    if (tables.length === 0) return;
    void downloadTableQrPdf(tables.map((t) => t.id));
  }

  return (
    <div className="space-y-6">
      <ContentHeaderAction>
        <Button size="sm" variant="secondary" onClick={downloadAll}>
          <Download size={14} /> QR PDF
        </Button>
      </ContentHeaderAction>

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
              description="Ask an admin to add tables and generate QR stickers."
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void downloadTableQrPdf([t.id])}
                    >
                      <Download size={14} /> QR
                    </Button>
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
