import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Armchair,
  Download,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  SectionTitle,
  StatCard,
} from "../../../common/ui";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  downloadTableQrPdf,
  fetchRestaurantTables,
  regenerateTableQr,
  updateRestaurantTable,
  type RestaurantTable,
} from "../../../api/tablesApi";
import toast from "react-hot-toast";

/**
 * Admin-only secondary screen for floor & QR management. Reads/writes the
 * live table set from the backend (tablesApi) instead of local mock data:
 * create, rename, resize, deactivate, regenerate a table's QR and bulk
 * download printable QR stickers as a PDF.
 */
export function TablesScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-tables"],
    queryFn: fetchRestaurantTables,
  });
  const tables: RestaurantTable[] = data?.tables ?? [];

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-tables"] });

  const createMutation = useMutation({
    mutationFn: (payload: {
      tableNumber: string;
      tableName: string;
      capacity: number;
    }) => createRestaurantTable(payload),
    onSuccess: () => {
      toast.success("Table added");
      setCreating(false);
      invalidate();
    },
    onError: () => toast.error("Could not create table"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      tableNumber?: string;
      tableName?: string;
      capacity?: number;
    }) =>
      updateRestaurantTable(payload.id, {
        tableNumber: payload.tableNumber,
        tableName: payload.tableName,
        capacity: payload.capacity,
      }),
    onSuccess: () => {
      toast.success("Table updated");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Could not update table"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRestaurantTable(id),
    onSuccess: () => {
      toast.success("Table removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove table"),
  });

  const regenerateMutation = useMutation({
    mutationFn: (id: string) => regenerateTableQr(id),
    onSuccess: () => {
      toast.success("QR regenerated");
      invalidate();
    },
    onError: () => toast.error("Could not regenerate QR"),
  });

  function downloadAll() {
    if (tables.length === 0) return;
    void downloadTableQrPdf(tables.map((t) => t.id));
  }

  if (isLoading) {
    return (
      <SecondaryScreenAdapter title="Tables & QR">
        <p className="text-sm text-zinc-400">Loading tables…</p>
      </SecondaryScreenAdapter>
    );
  }

  if (isError) {
    return (
      <SecondaryScreenAdapter title="Tables & QR">
        <EmptyState
          title="Couldn't load tables"
          description="Check your connection and try again."
        />
      </SecondaryScreenAdapter>
    );
  }

  const activeCount = tables.filter((t) => t.isActive).length;

  return (
    <SecondaryScreenAdapter title="Tables & QR">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total" value={tables.length} />
            <StatCard label="Active" value={activeCount} />
            <StatCard
              label="Hidden"
              value={tables.length - activeCount}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={downloadAll}>
              <Download size={14} /> QR PDF
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={14} /> Add table
            </Button>
          </div>
        </div>

        <SectionTitle>Floor plan</SectionTitle>

        {tables.length === 0 ? (
          <EmptyState
            title="No tables yet"
            description="Add a table to start generating QR stickers for your floor."
            action={
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus size={14} /> Add table
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => (
              <Card key={t.id} className="flex flex-col gap-3">
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
                      <span>{t.capacity} seats</span>
                    </div>
                  </div>
                  <Badge tone={t.isActive ? "green" : "zinc"}>
                    {t.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => regenerateMutation.mutate(t.id)}
                    loading={regenerateMutation.isPending}
                  >
                    <RefreshCw size={14} /> QR
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(t.id)}
                    loading={deleteMutation.isPending}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add table"
        description="A printable QR sticker is generated automatically."
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              form="create-table-form"
              type="submit"
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </>
        }
      >
        <CreateTableForm
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit table"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              form="edit-table-form"
              type="submit"
              loading={updateMutation.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <EditTableForm
            table={editing}
            onSubmit={(payload) =>
              updateMutation.mutate({ id: editing.id, ...payload })
            }
          />
        )}
      </Modal>
    </SecondaryScreenAdapter>
  );
}

function CreateTableForm({
  onSubmit,
}: {
  onSubmit: (payload: {
    tableNumber: string;
    tableName: string;
    capacity: number;
  }) => void;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");

  return (
    <form
      id="create-table-form"
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const cap = Number(capacity);
        if (!tableNumber.trim() || !tableName.trim() || !cap || cap <= 0) {
          toast.error("Table number, name and a valid capacity are required");
          return;
        }
        onSubmit({
          tableNumber: tableNumber.trim(),
          tableName: tableName.trim(),
          capacity: cap,
        });
      }}
    >
      <Input
        label="Table number"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="12"
      />
      <Input
        label="Table name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        placeholder="Window seat"
      />
      <Input
        label="Capacity (seats)"
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="4"
      />
    </form>
  );
}

function EditTableForm({
  table,
  onSubmit,
}: {
  table: RestaurantTable;
  onSubmit: (payload: {
    tableNumber?: string;
    tableName?: string;
    capacity?: number;
  }) => void;
}) {
  const [tableNumber, setTableNumber] = useState(table.tableNumber);
  const [tableName, setTableName] = useState(table.tableName);
  const [capacity, setCapacity] = useState(String(table.capacity));

  return (
    <form
      id="edit-table-form"
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const cap = Number(capacity);
        if (!cap || cap <= 0) {
          toast.error("Enter a valid capacity");
          return;
        }
        onSubmit({
          tableNumber: tableNumber.trim(),
          tableName: tableName.trim(),
          capacity: cap,
        });
      }}
    >
      <Input
        label="Table number"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
      />
      <Input
        label="Table name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <Input
        label="Capacity (seats)"
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />
    </form>
  );
}

