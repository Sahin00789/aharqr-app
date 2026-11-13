import { useEffect, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import {
  Armchair,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  ShoppingBag,
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
} from "../../../hooks/use-restaurant";
import toast from "react-hot-toast";
import { STICKER_H, STICKER_W, stickerArt } from "../../../utils/sticker-art";

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
  const [creatingTakeaway, setCreatingTakeaway] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [printing, setPrinting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const createMutation = useCreateRestaurantTable({
    onSuccess: (isTakeaway) => {
      toast.success(isTakeaway ? "Takeaway channel added" : "Table added");
      setCreating(false);
      setCreatingTakeaway(false);
    },
    onError: () => toast.error("Could not save — check the number is unique"),
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
  const dineInTables = tables.filter((t) => !t.isTakeaway);
  const takeawayTables = tables.filter((t) => t.isTakeaway);

  /**
   * Opens the takeaway-channel form. Unlike a floor table, a channel needs a
   * name + number so several counters (dine-in pickup, delivery counter…) can
   * each carry their own QR.
   */
  function addTakeawayChannel() {
    setCreatingTakeaway(true);
  }

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
  const hiddenCount = tables.length - activeCount;
  const restaurantName = restaurant?.name?.trim() || undefined;
  const restaurantAddress = restaurant
    ? formatRestaurantAddress(restaurant).trim() || undefined
    : undefined;
  const restaurantPhone = restaurant?.phone?.trim() || undefined;
  const restaurantLogo = restaurant?.logo ?? null;

  function renderTableCards(rows: RestaurantTable[]) {
    return rows.map((t) => (
      <TableCard
        key={t.id}
        table={t}
        restaurantName={restaurantName}
        restaurantAddress={restaurantAddress}
        restaurantPhone={restaurantPhone}
        restaurantLogo={restaurantLogo}
        isRegenerating={
          regenerateMutation.isPending && regenerateMutation.variables === t.id
        }
        isTogglingActive={
          updateMutation.isPending && updateMutation.variables?.id === t.id
        }
        isDeleting={deleteMutation.isPending}
        onRegenerate={() => regenerateMutation.mutate(t.id)}
        onToggleActive={() =>
          updateMutation.mutate({ id: t.id, isActive: !t.isActive })
        }
        onEdit={() => setEditing(t)}
        onDelete={() => deleteMutation.mutate(t.id)}
      />
    ));
  }

  return (
    <SecondaryScreenAdapter title="Tables & QR">
      <div className="space-y-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Tables"
            value={dineInTables.length}
            icon={<Armchair size={15} />}
            hint="Dine-in floor"
          />
          <StatCard
            label="Takeaway"
            value={takeawayTables.length}
            icon={<ShoppingBag size={15} />}
            hint="Pickup channels"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<CheckCircle2 size={15} />}
            tone="green"
            hint="Live QR stickers"
          />
          <StatCard
            label="Hidden"
            value={hiddenCount}
            icon={<EyeOff size={15} />}
            tone="amber"
            hint="Not scannable"
          />
        </div>

        <Card className="flex flex-wrap items-center justify-between gap-4 border-accent-100 bg-gradient-to-r from-accent-50/70 via-white to-white dark:border-accent-500/20 dark:from-accent-500/10 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-sm shadow-accent-600/30">
              <QrCode className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Printable QR stickers
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {printableTables.length > 0
                  ? `${printableTables.length} sticker${
                      printableTables.length === 1 ? "" : "s"
                    } ready. Previews match the printed A4 sheet (2×2).`
                  : "Add a table or takeaway channel to create its printable sticker."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={openPrintModal}
              disabled={printableTables.length === 0}
            >
              <Download size={14} /> Print QR PDF
            </Button>
            <Button size="sm" variant="secondary" onClick={addTakeawayChannel}>
              <ShoppingBag size={14} /> Add takeaway channel
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={14} /> Add table
            </Button>
          </div>
        </Card>

        {takeawayTables.length > 0 && (
          <section className="space-y-3">
            <SectionHeading
              title="Takeaway channels"
              description="Counter stickers for pickup orders — no table needed."
              count={takeawayTables.length}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {renderTableCards(takeawayTables)}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <SectionHeading
            title="Floor plan"
            description="Every table's sticker, ready to print and place."
            count={dineInTables.length}
          />
          {dineInTables.length === 0 ? (
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {renderTableCards(dineInTables)}
            </div>
          )}
        </section>
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
        open={creatingTakeaway}
        onClose={() => setCreatingTakeaway(false)}
        title="Add takeaway channel"
        description="Guests scan this channel's QR to place a takeaway order — no table needed."
        icon={<ShoppingBag size={18} />}
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCreatingTakeaway(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              form="create-takeaway-form"
              type="submit"
              loading={createMutation.isPending}
            >
              Save channel
            </Button>
          </>
        }
      >
        <CreateTakeawayChannelForm
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.isTakeaway ? "Edit takeaway channel" : "Edit table"}
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
                      {t.isTakeaway ? (
                        <ShoppingBag className="h-4 w-4 shrink-0 text-accent-600" />
                      ) : (
                        <Armchair className="h-4 w-4 shrink-0 text-accent-600" />
                      )}
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

function SectionHeading({
  title,
  description,
  count,
}: {
  title: string;
  description?: string;
  count: number;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <SectionTitle>{title}</SectionTitle>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {count}
          </span>
        </div>
        {description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  loading = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${
        danger
          ? "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          : ""
      }`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : children}
    </button>
  );
}

/** Artwork never changes — build the shape list once. */
const STICKER_ART = stickerArt();

/**
 * Faithful DOM replica of the printable sticker produced by
 * `utils/qrPdfGenerator.tsx`: the same Indian block-print background artwork
 * (corner rangoli rosettes, buti side borders, a triangular hem, a double
 * frame and soft colour blooms), orange accent strip, centred restaurant
 * identity, table identity, bracket-framed QR plate, scan hint and AharQR
 * footer. Sizes use container-query units so the preview scales exactly like
 * the PDF regardless of column width.
 */
function StickerPreview({
  table,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  restaurantLogo,
}: {
  table: RestaurantTable;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantLogo?: string | null;
}) {
  const [logoOk, setLogoOk] = useState(true);
  const [appLogoOk, setAppLogoOk] = useState(true);

  const isTakeaway = Boolean(table.isTakeaway);
  const name = restaurantName?.trim() || "Restaurant";
  const tableName =
    table.tableName?.trim() ||
    (isTakeaway ? "Takeaway Counter" : `Table ${table.tableNumber}`);
  const tableMeta = isTakeaway
    ? "SCAN TO ORDER"
    : `TABLE ${table.tableNumber}${
        table.capacity ? `  ·  ${table.capacity} SEATS` : ""
      }`;

  return (
    <div className="relative aspect-[267/364] w-full overflow-hidden rounded-2xl border border-[#e6ded4] bg-[#fffdfa] shadow-sm @container">
      {/* Decorative artwork — shared with the printable sticker */}
      <svg
        viewBox={`0 0 ${STICKER_W} ${STICKER_H}`}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {STICKER_ART.map((shape, index) => {
          const fill = shape.fill ?? "none";
          if (shape.kind === "circle") {
            return (
              <circle
                key={index}
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                fill={fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            );
          }
          if (shape.kind === "rect") {
            return (
              <rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                fill={fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            );
          }
          return (
            <path
              key={index}
              d={shape.d}
              fill={fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        })}
      </svg>

      <div className="relative flex h-full flex-col">
        <div className="h-[1.87cqw] w-full shrink-0 bg-[#d97736]" />
        <div className="flex w-full flex-1 flex-col items-center px-[5.24cqw] pt-[4.12cqw] pb-[3.37cqw]">
          {/* 1. Restaurant identity */}
          <div className="flex w-full items-center justify-center">
            {restaurantLogo && logoOk && (
              <div className="mr-[3.75cqw] h-[14.23cqw] w-[14.23cqw] shrink-0 rounded-[4.49cqw] border border-[#efe7dd] bg-white p-[1.12cqw]">
                <img
                  key={restaurantLogo}
                  src={restaurantLogo}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={() => setLogoOk(false)}
                />
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="line-clamp-2 text-[5.62cqw] leading-tight font-bold tracking-[0.02em] text-[#142238]">
                {name}
              </p>
              {restaurantAddress && (
                <p className="mt-[0.75cqw] line-clamp-2 text-[2.62cqw] leading-[1.2] text-[#64748b]">
                  {restaurantAddress}
                </p>
              )}
              {restaurantPhone && (
                <p className="mt-[0.75cqw] text-[2.85cqw] leading-[1.2] font-bold tracking-[0.04em] text-[#9a552b]">
                  {restaurantPhone}
                </p>
              )}
            </div>
          </div>

          {/* 2. Table identity */}
          <p className="mt-[3cqw] line-clamp-2 max-w-full text-center text-[7.12cqw] leading-tight font-bold break-words text-[#142238]">
            {tableName}
          </p>
          <div className="mt-[1.12cqw] h-[1.12cqw] w-[9.74cqw] rounded-full bg-[#d97736]" />
          <p className="mt-[1.5cqw] text-center text-[2.77cqw] font-bold tracking-[0.16em] text-[#9a552b]">
            {tableMeta}
          </p>

          {/* 3. Big scannable QR on a white plate */}
          <div className="relative mt-[3cqw] rounded-[6cqw] border border-[#f1e8dd] bg-white p-[3cqw]">
            <TableQr
              url={table.qrUrl ?? null}
              className="h-[56.93cqw] w-[56.93cqw]"
            />
            <span className="absolute -top-[0.75cqw] -left-[0.75cqw] h-[5.6cqw] w-[5.6cqw] rounded-tl-[2.6cqw] border-t-2 border-l-2 border-[#d97736]" />
            <span className="absolute -top-[0.75cqw] -right-[0.75cqw] h-[5.6cqw] w-[5.6cqw] rounded-tr-[2.6cqw] border-t-2 border-r-2 border-[#d97736]" />
            <span className="absolute -bottom-[0.75cqw] -left-[0.75cqw] h-[5.6cqw] w-[5.6cqw] rounded-bl-[2.6cqw] border-b-2 border-l-2 border-[#d97736]" />
            <span className="absolute -right-[0.75cqw] -bottom-[0.75cqw] h-[5.6cqw] w-[5.6cqw] rounded-br-[2.6cqw] border-r-2 border-b-2 border-[#d97736]" />
          </div>
          <p className="mt-[2.25cqw] text-center text-[2.62cqw] font-bold tracking-[0.18em] text-[#64748b]">
            {isTakeaway ? "SCAN · ORDER · PICK UP" : "SCAN · VIEW MENU · ORDER"}
          </p>

          {/* 4. AharQR branding */}
          <div className="mt-auto flex w-full flex-col items-center border-t border-dashed border-[#efe7dd] pt-[2.25cqw]">
            <p className="mb-[0.75cqw] text-[2.4cqw] font-bold tracking-[0.18em] text-[#a8b1bd]">
              POWERED BY
            </p>
            {appLogoOk ? (
              <img
                src="/aharqr-logo-tight.png"
                alt="AharQR"
                className="h-[7.13cqw] w-[17.23cqw] object-contain"
                onError={() => setAppLogoOk(false)}
              />
            ) : (
              <span className="text-[3.56cqw] font-bold tracking-[0.15em] text-[#9a552b]">
                AHARQR
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableCard({
  table,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  restaurantLogo,
  isRegenerating,
  isTogglingActive,
  isDeleting,
  onRegenerate,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  table: RestaurantTable;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantLogo?: string | null;
  isRegenerating: boolean;
  isTogglingActive: boolean;
  isDeleting: boolean;
  onRegenerate: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isTakeaway = Boolean(table.isTakeaway);

  return (
    <div className="flex flex-col gap-2">
      <StickerPreview
        table={table}
        restaurantName={restaurantName}
        restaurantAddress={restaurantAddress}
        restaurantPhone={restaurantPhone}
        restaurantLogo={restaurantLogo}
      />

      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Badge tone={table.isActive ? "green" : "zinc"}>
            {table.isActive ? "Active" : "Hidden"}
          </Badge>
          <span className="truncate text-[11px] font-medium text-zinc-400">
            {isTakeaway ? "Takeaway channel" : `${table.capacity} seats`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            label="Regenerate QR"
            onClick={onRegenerate}
            loading={isRegenerating}
          >
            <RefreshCw size={15} />
          </IconButton>
          <IconButton
            label={isTakeaway ? "Edit channel" : "Edit table"}
            onClick={onEdit}
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            label={table.isActive ? "Hide sticker" : "Show sticker"}
            onClick={onToggleActive}
            loading={isTogglingActive}
          >
            {table.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} loading={isDeleting} danger>
            <Trash2 size={15} />
          </IconButton>
        </div>
      </div>
    </div>
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

function CreateTakeawayChannelForm({
  onSubmit,
}: {
  onSubmit: (payload: {
    tableNumber: string;
    tableName: string;
    capacity: number;
    isTakeaway: boolean;
  }) => void;
}) {
  const [channelNumber, setChannelNumber] = useState("");
  const [channelName, setChannelName] = useState("");

  return (
    <form
      id="create-takeaway-form"
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!channelNumber.trim() || !channelName.trim()) {
          toast.error("Channel number and channel name are required");
          return;
        }
        onSubmit({
          tableNumber: channelNumber.trim(),
          tableName: channelName.trim(),
          capacity: 1,
          isTakeaway: true,
        });
      }}
    >
      <Input
        label="Channel number"
        value={channelNumber}
        onChange={(e) => setChannelNumber(e.target.value)}
        placeholder="TAKEAWAY-1"
      />
      <Input
        label="Channel name"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="Takeaway Counter"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        The channel number must be unique. Its printable QR is generated
        automatically and opens the takeaway menu.
      </p>
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
  const isTakeaway = Boolean(table.isTakeaway);

  return (
    <form
      id="edit-table-form"
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!tableNumber.trim() || !tableName.trim()) {
          toast.error(
            isTakeaway
              ? "Channel number and channel name are required"
              : "Table number and table name are required"
          );
          return;
        }
        if (isTakeaway) {
          onSubmit({
            tableNumber: tableNumber.trim(),
            tableName: tableName.trim(),
          });
          return;
        }
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
        label={isTakeaway ? "Channel number" : "Table number"}
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
      />
      <Input
        label={isTakeaway ? "Channel name" : "Table name"}
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      {!isTakeaway && (
        <Input
          label="Capacity (seats)"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Renders a table QR code client-side (qrcode lib -> data URL)      */
/* ------------------------------------------------------------------ */

function TableQr({
  url,
  className = "h-24 w-24",
}: {
  url: string | null;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    // Same encoding options as the printable PDF so the on-screen preview is
    // byte-for-byte identical to the sticker that gets printed.
    void QRCode.toDataURL(url, {
      margin: 2,
      width: 260,
      errorCorrectionLevel: "H",
      color: { dark: "#111827", light: "#ffffff" },
    })
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
      <div
        className={`shrink-0 rounded-[1cqw] bg-zinc-100 dark:bg-zinc-800 ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Table QR"
      className={`block shrink-0 bg-white ${className}`}
    />
  );
}
