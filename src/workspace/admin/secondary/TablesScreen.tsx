import { useEffect, useState } from "react";
import QRCode from "qrcode";
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
} from "../../../common/components";
import { type RestaurantTable } from "../../../api/tablesApi";
import {
  useCreateRestaurantTable,
  useDeleteRestaurantTable,
  useRegenerateTableQr,
  useRestaurantTables,
  useUpdateRestaurantTable,
} from "../../../hooks/use-tables";
import {
  formatRestaurantAddress,
  useMyRestaurant,
} from "../../../hooks/use-restaurant";import toast from "react-hot-toast";

/**
 * Admin-only secondary screen for floor & QR management. Reads/writes the
 * live table set from the backend (tablesApi) instead of local mock data:
 * create, rename, resize, deactivate, regenerate a table's QR and bulk
 * download printable QR stickers as a PDF.
 */
export function TablesScreen() {
  const { data: tables = [], isLoading, isError } = useRestaurantTables();
  const { data: restaurant } = useMyRestaurant();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [printing, setPrinting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const createMutation = useCreateRestaurantTable({
    onSuccess: () => {
      toast.success("Table added");
      setCreating(false);
    },
    onError: () => toast.error("Could not create table"),
  });

  const updateMutation = useUpdateRestaurantTable({
    onSuccess: () => {
      toast.success("Table updated");
      setEditing(null);
    },
    onError: () => toast.error("Could not update table"),
  });

  const deleteMutation = useDeleteRestaurantTable({
    onSuccess: () => toast.success("Table removed"),
    onError: () => toast.error("Could not remove table"),
  });

  const regenerateMutation = useRegenerateTableQr({
    onSuccess: () => toast.success("QR regenerated"),
    onError: () => toast.error("Could not regenerate QR"),
  });

  const printableTables = tables.filter((t) => Boolean(t.qrUrl));

  function openPrintModal() {
    if (printableTables.length === 0) {
      toast.error("No table QR codes available to print yet");
      return;
    }
    setSelectedIds(new Set(printableTables.map((t) => t.id)));
    setPrinting(true);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllTables() {
    setSelectedIds(new Set(printableTables.map((t) => t.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function downloadSelected() {
    const items = printableTables
      .filter((t) => selectedIds.has(t.id))
      .map((t) => ({
        qrUrl: t.qrUrl as string,
        tableNumber: t.tableNumber,
        tableName: t.tableName,
        restaurantName: restaurant?.name,
        restaurantAddress: restaurant
          ? formatRestaurantAddress(restaurant)
          : undefined,
        restaurantPhone: restaurant?.phone ?? undefined,
        restaurantLogo: restaurant?.logo ?? null,
        capacity: t.capacity,
        isTakeaway: t.isTakeaway,
      }));

    if (items.length === 0) return;

    setGeneratingPdf(true);
    try {
      const { downloadQrStickersPdf } = await import(
        "../../../utils/qrPdfGenerator"
      );
      await downloadQrStickersPdf(items);
      setPrinting(false);
    } catch {
      toast.error("Could not generate the QR PDF");
    } finally {
      setGeneratingPdf(false);
    }
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
            <Button
              size="sm"
              variant="secondary"
              onClick={openPrintModal}
              disabled={printableTables.length === 0}
            >
              <Download size={14} /> Print QR PDF
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

                <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <TableQr url={t.qrUrl ?? null} />
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Scan to open the menu
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => regenerateMutation.mutate(t.id)}
                    loading={
                      regenerateMutation.isPending &&
                      regenerateMutation.variables === t.id
                    }
                    aria-label={`Regenerate QR for ${t.tableName || `Table ${t.tableNumber}`}`}
                  >
                    <RefreshCw size={14} /> Regenerate QR
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

      <Modal
        open={printing}
        onClose={() => setPrinting(false)}
        title="Print QR stickers"
        description="Pick the tables to include on the A4 sticker sheet (2×2 per page)."
        icon={<QrCode size={18} />}
        size="lg"
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPrinting(false)}
              disabled={generatingPdf}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={downloadSelected}
              loading={generatingPdf}
              loadingText="Generating…"
              disabled={selectedIds.size === 0}
            >
              <Download size={14} /> Download PDF
            </Button>
          </>
        }
      >
        {printableTables.length === 0 ? (
          <EmptyState
            title="No QR codes yet"
            description="Add a table or regenerate its QR code first."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {selectedIds.size} of {printableTables.length} selected
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={selectAllTables}>
                  Select all
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                  disabled={selectedIds.size === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {printableTables.map((t) => {
                const checked = selectedIds.has(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition ${
                      checked
                        ? "bg-accent-50/60 dark:bg-accent-500/10"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(t.id)}
                      className="h-4 w-4 shrink-0 rounded border-zinc-300 text-accent-600 focus:ring-2 focus:ring-accent-500/30 dark:border-zinc-600"
                    />
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <Armchair className="h-4 w-4 shrink-0 text-accent-600" />
                      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {t.tableName || `Table ${t.tableNumber}`}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">
                        #{t.tableNumber}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {t.isTakeaway && <Badge tone="indigo">Takeaway</Badge>}
                      {!t.isActive && <Badge tone="zinc">Hidden</Badge>}
                      <Badge tone="green">v{t.qrVersion}</Badge>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
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

/* ------------------------------------------------------------------ */
/*  Renders a table QR code client-side (qrcode lib -> data URL)      */
/* ------------------------------------------------------------------ */

function TableQr({ url }: { url: string | null }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void QRCode.toDataURL(url, { margin: 1, width: 256 })
      .then((dataUrl: string) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url || !src) {
    return (
      <div className="h-[96px] w-[96px] shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    );
  }

  return (
    <img
      src={src}
      alt="Table QR"
      className="h-[96px] w-[96px] shrink-0 rounded-lg bg-white"
    />
  );
}
