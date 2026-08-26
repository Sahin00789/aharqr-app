import { Armchair, Users } from "lucide-react";
import { SectionTitle, StatCard } from "../../../common/ui";
import { Card, Badge } from "../../../common/ui";
import { MOCK_TABLES } from "../../../common/mock";

type TableStatus = "FREE" | "OCCUPIED" | "RESERVED";

const TABLE_TONE: Record<TableStatus, "green" | "amber" | "indigo"> = {
  FREE: "green",
  OCCUPIED: "amber",
  RESERVED: "indigo",
};

export function ObserverTablesTab() {
  const tables = MOCK_TABLES;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={tables.length} />
        <StatCard
          label="Free"
          value={tables.filter((t) => t.status === "FREE").length}
        />
        <StatCard
          label="Occupied"
          value={tables.filter((t) => t.status === "OCCUPIED").length}
        />
        <StatCard
          label="Reserved"
          value={tables.filter((t) => t.status === "RESERVED").length}
        />
      </div>

      <SectionTitle>Tables</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => (
          <Card key={t.number}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Armchair className="h-5 w-5 text-indigo-600" />
                  Table {t.number}
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {t.seats} seats
                  </span>
                  {t.party != null && <span>Party of {t.party}</span>}
                </div>
              </div>
              <Badge tone={TABLE_TONE[t.status]}>{t.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
