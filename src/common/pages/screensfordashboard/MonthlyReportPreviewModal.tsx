import { useState, type ReactNode } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Modal } from "../../components";
import { formatINR } from "../../components/charts";
import { useMonthlyReport } from "../../../hooks/use-reports";
import type {
  MonthlyReportOrder,
  MonthlyStaffPerformance,
} from "../../../api/reportsApi";

/**
 * Data preview shown before the monthly report PDF is generated.
 *
 * Deliberately NOT the overview dashboard and not chart-driven: the report is
 * a working document listing the month's summary statistics, every order with
 * its line items, and per-staff performance.
 */

type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
};

type Row = Record<string, ReactNode>;

function DataTable({
  columns,
  rows,
  empty = "No records for this month.",
  footer,
  minWidth = 480,
}: {
  columns: Column[];
  rows: Row[];
  empty?: string;
  footer?: Row;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table
        className="w-full text-left"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/40">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-3 py-2 text-[10px] font-bold tracking-wide whitespace-nowrap text-zinc-500 uppercase dark:text-zinc-400 ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-4 text-center text-xs text-zinc-400"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={index}
                className="align-top odd:bg-white even:bg-zinc-50/50 dark:odd:bg-zinc-900 dark:even:bg-zinc-900/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 ${
                      column.align === "right"
                        ? "text-right tabular-nums"
                        : "text-left"
                    }`}
                  >
                    {row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 ${
                    column.align === "right"
                      ? "text-right tabular-nums"
                      : "text-left"
                  }`}
                >
                  {footer[column.key] ?? ""}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function PreviewSection({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h3 className="text-[11px] font-bold tracking-[0.12em] text-zinc-500 uppercase dark:text-zinc-400">
          {title}
        </h3>
        {meta && (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  APPROVED: "Approved",
  ACCEPTED_FOR_COOK: "Cooking",
  PREPARED: "Prepared",
  COLLECTED_FROM_KITCHEN: "Collected",
  SERVED: "Served",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PAID: "Paid",
};

function statusLabel(status: string): string {
  return (
    STATUS_LABELS[status] ??
    status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function duration(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value < 60) return `${Math.round(value)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function dayText(key: string): string {
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateTimeText(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function orderItems(order: MonthlyReportOrder): string {
  if (order.items.length === 0) return "—";
  return order.items
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");
}

type StaffTableConfig = {
  role: "ADMIN" | "CAPTAIN" | "CHEF";
  title: string;
  description: string;
  minWidth: number;
  columns: Column[];
  toRow: (member: MonthlyStaffPerformance) => Row;
};

const STAFF_TABLES: StaffTableConfig[] = [
  {
    role: "ADMIN",
    title: "Admin performance",
    description: "Full order pipeline plus revenue settlement",
    minWidth: 760,
    columns: [
      { key: "name", label: "Admin" },
      { key: "created", label: "Orders created", align: "right" },
      { key: "accepted", label: "Accepted", align: "right" },
      { key: "prepared", label: "Prepared", align: "right" },
      { key: "served", label: "Served", align: "right" },
      { key: "completed", label: "Completed", align: "right" },
      { key: "cancelled", label: "Cancelled", align: "right" },
      { key: "revenue", label: "Revenue handled", align: "right" },
    ],
    toRow: (member) => ({
      name: member.name,
      created: member.ordersCreated.toLocaleString("en-IN"),
      accepted: member.ordersAccepted.toLocaleString("en-IN"),
      prepared: member.ordersPrepared.toLocaleString("en-IN"),
      served: member.ordersServed.toLocaleString("en-IN"),
      completed: member.ordersCompleted.toLocaleString("en-IN"),
      cancelled: member.ordersCancelled.toLocaleString("en-IN"),
      revenue: formatINR(member.revenueHandled),
    }),
  },
  {
    role: "CAPTAIN",
    title: "Captain performance",
    description: "Order taking, serving and table completion",
    minWidth: 700,
    columns: [
      { key: "name", label: "Captain" },
      { key: "created", label: "Orders created", align: "right" },
      { key: "served", label: "Served", align: "right" },
      { key: "completed", label: "Completed", align: "right" },
      { key: "cancelled", label: "Cancelled", align: "right" },
      { key: "serve", label: "Avg serve time", align: "right" },
      { key: "revenue", label: "Revenue handled", align: "right" },
    ],
    toRow: (member) => ({
      name: member.name,
      created: member.ordersCreated.toLocaleString("en-IN"),
      served: member.ordersServed.toLocaleString("en-IN"),
      completed: member.ordersCompleted.toLocaleString("en-IN"),
      cancelled: member.ordersCancelled.toLocaleString("en-IN"),
      serve: duration(member.avgServeSeconds),
      revenue: formatINR(member.revenueHandled),
    }),
  },
  {
    role: "CHEF",
    title: "Chef performance",
    description: "Kitchen acceptance, cooking output and cancellations",
    minWidth: 700,
    columns: [
      { key: "name", label: "Chef" },
      { key: "accepted", label: "Accepted", align: "right" },
      { key: "prepared", label: "Prepared", align: "right" },
      { key: "items", label: "Items cooked", align: "right" },
      { key: "prep", label: "Avg cook time", align: "right" },
      { key: "cancelled", label: "Cancelled", align: "right" },
    ],
    toRow: (member) => ({
      name: member.name,
      accepted: member.ordersAccepted.toLocaleString("en-IN"),
      prepared: member.ordersPrepared.toLocaleString("en-IN"),
      items: member.itemsPrepared.toLocaleString("en-IN"),
      prep: duration(member.avgPrepSeconds),
      cancelled: member.ordersCancelled.toLocaleString("en-IN"),
    }),
  },
];

function staffRowsFor(
  staff: MonthlyStaffPerformance[],
  config: StaffTableConfig,
): Row[] {
  return staff
    .filter((member) => member.role === config.role)
    .map((member) => config.toRow(member));
}


export function MonthlyReportPreviewModal({
  open,
  onClose,
  month,
  monthLabel,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  generatedBy,
}: {
  open: boolean;
  onClose: () => void;
  /** Calendar month in YYYY-MM format. */
  month: string;
  monthLabel: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string | null;
  generatedBy?: string;
}) {
  const { data: report, isLoading, isError, isFetching, refetch } =
    useMonthlyReport(month, open);
  const [downloading, setDownloading] = useState(false);

  const stats = report?.stats;
  const orders = report?.orders ?? [];
  const staff = report?.staff ?? [];

  async function downloadReport() {
    if (!report) return;
    setDownloading(true);
    try {
      const { downloadMonthlyReportPdf } = await import(
        "../../../utils/monthlyReportPdfGenerator"
      );
      await downloadMonthlyReportPdf({
        report,
        monthLabel,
        restaurantName,
        restaurantAddress,
        restaurantPhone,
        generatedBy,
      });
      toast.success("Monthly report downloaded");
    } catch {
      toast.error("Could not generate the report PDF");
    } finally {
      setDownloading(false);
    }
  }

  const totalOrderRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      icon={<FileText size={18} />}
      title="Monthly report preview"
      description={`${monthLabel} · summary, every order and staff performance`}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => void downloadReport()}
            loading={downloading}
            loadingText="Building…"
            disabled={!report}
          >
            <Download size={14} /> Download PDF
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 size={22} className="animate-spin text-accent-600" />
          Loading {monthLabel} report data…
        </div>
      ) : isError || !report || !stats ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Couldn't load the monthly report
          </p>
          <p className="max-w-sm text-xs text-zinc-500">
            Check your connection and try again.
          </p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Report identity */}
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-accent-50/70 via-white to-white p-4 dark:border-zinc-800 dark:from-accent-500/10 dark:via-zinc-900 dark:to-zinc-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.12em] text-accent-700 uppercase dark:text-accent-300">
                  Monthly performance report
                </p>
                <p className="mt-1 truncate text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {restaurantName || "Restaurant"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {[restaurantAddress, restaurantPhone]
                    .filter(Boolean)
                    .join(" · ") || "AharQR partner restaurant"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {monthLabel}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {report.range.days}{" "}
                  {report.range.days === 1 ? "day" : "days"} of data ·{" "}
                  {orders.length} orders
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {generatedBy ? `Prepared by ${generatedBy}` : "Prepared for review"}
                  {isFetching ? " · refreshing…" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Summary statistics */}
          <PreviewSection title="Summary statistics">
            <DataTable
              columns={[
                { key: "metric", label: "Metric" },
                { key: "value", label: "Value", align: "right" },
                { key: "note", label: "Note" },
              ]}
              rows={[
                {
                  metric: "Revenue",
                  value: formatINR(stats.revenue),
                  note:
                    stats.revenueChangePct === 0
                      ? "Flat vs previous period"
                      : `${stats.revenueChangePct > 0 ? "+" : ""}${Math.round(
                          stats.revenueChangePct,
                        )}% vs previous period`,
                },
                {
                  metric: "Orders",
                  value: stats.orders.toLocaleString("en-IN"),
                  note: `${stats.completed.toLocaleString("en-IN")} completed · ${stats.cancelled.toLocaleString("en-IN")} cancelled`,
                },
                {
                  metric: "Average order value",
                  value: formatINR(stats.avgOrderValue),
                  note: "Per non-cancelled order",
                },
                {
                  metric: "Completion rate",
                  value: `${Math.round(stats.completionRate ?? 0)}%`,
                  note: "Of closed orders",
                },
                {
                  metric: "Previous period",
                  value: formatINR(stats.previousRevenue),
                  note: `${stats.previousOrders.toLocaleString("en-IN")} orders`,
                },
                {
                  metric: "Dine-in",
                  value: `${stats.channelSplit.find((c) => c.key === "DINE_IN")?.orders ?? 0} orders`,
                  note: formatINR(
                    stats.channelSplit.find((c) => c.key === "DINE_IN")
                      ?.revenue ?? 0,
                  ),
                },
                {
                  metric: "Takeaway",
                  value: `${stats.channelSplit.find((c) => c.key === "TAKEAWAY")?.orders ?? 0} orders`,
                  note: formatINR(
                    stats.channelSplit.find((c) => c.key === "TAKEAWAY")
                      ?.revenue ?? 0,
                  ),
                },
                {
                  metric: "Best day",
                  value: stats.bestDay ? dayText(stats.bestDay.key) : "—",
                  note: stats.bestDay
                    ? `${formatINR(stats.bestDay.revenue)} · ${stats.bestDay.orders} orders`
                    : "No orders this month",
                },
                {
                  metric: "Busiest hour",
                  value: stats.peakHour?.label || "—",
                  note: stats.peakHour
                    ? `${formatINR(stats.peakHour.revenue)} · ${stats.peakHour.orders} orders`
                    : "No orders this month",
                },
              ]}
            />
          </PreviewSection>

          {/* Staff performance — one table per role with only that role's actions */}
          {STAFF_TABLES.map((config) => {
            const members = staff.filter(
              (member) => member.role === config.role,
            );
            return (
              <PreviewSection
                key={config.role}
                title={config.title}
                meta={`${members.length} ${
                  config.role === "ADMIN"
                    ? "admin"
                    : config.role === "CAPTAIN"
                      ? "captain"
                      : "chef"
                }${members.length === 1 ? "" : "s"} · ${config.description}`}
              >
                <DataTable
                  minWidth={config.minWidth}
                  columns={config.columns}
                  rows={staffRowsFor(staff, config)}
                  empty={`No ${config.role.toLowerCase()} activity recorded this month.`}
                />
              </PreviewSection>
            );
          })}

          {/* Every order */}
          <PreviewSection
            title="All orders"
            meta={`${orders.length} orders · ${formatINR(totalOrderRevenue)}`}
          >
            <DataTable
              minWidth={1080}
              columns={[
                { key: "date", label: "Date" },
                { key: "number", label: "Order #" },
                { key: "type", label: "Type" },
                { key: "table", label: "Table / Channel" },
                { key: "customer", label: "Customer" },
                { key: "items", label: "Items" },
                { key: "status", label: "Status" },
                { key: "payment", label: "Payment" },
                { key: "total", label: "Total", align: "right" },
              ]}
              rows={orders.map((order) => ({
                date: dateTimeText(order.createdAt),
                number: order.orderNumber,
                type: order.orderType === "TAKEAWAY" ? "Takeaway" : "Dine-in",
                table:
                  order.orderType === "TAKEAWAY"
                    ? "Takeaway counter"
                    : order.tableNumber
                      ? `#${order.tableNumber}${order.tableName ? ` · ${order.tableName}` : ""}`
                      : "—",
                customer:
                  order.customerName ||
                  (order.createdByType === "CUSTOMER_QR" ? "Guest" : "Walk-in"),
                items: orderItems(order),
                status: statusLabel(order.status),
                payment: statusLabel(order.paymentStatus),
                total: formatINR(order.totalAmount),
              }))}
              footer={
                orders.length > 0
                  ? {
                      date: "",
                      number: "",
                      type: "",
                      table: "",
                      customer: "",
                      items: "Total (non-cancelled revenue)",
                      status: "",
                      payment: "",
                      total: formatINR(totalOrderRevenue),
                    }
                  : undefined
              }
              empty="No orders recorded this month."
            />
          </PreviewSection>

          {/* Top dishes */}
          <PreviewSection
            title="Top dishes"
            meta={`${stats.topDishes.length} dishes`}
          >
            <DataTable
              columns={[
                { key: "rank", label: "#", align: "right" },
                { key: "dish", label: "Dish" },
                { key: "quantity", label: "Qty sold", align: "right" },
                { key: "revenue", label: "Revenue", align: "right" },
              ]}
              rows={stats.topDishes.map((dish, index) => ({
                rank: index + 1,
                dish: dish.name || "—",
                quantity: dish.quantity.toLocaleString("en-IN"),
                revenue: formatINR(dish.revenue),
              }))}
              empty="Dish sales appear once orders are accepted."
            />
          </PreviewSection>
        </div>
      )}
    </Modal>
  );
}
