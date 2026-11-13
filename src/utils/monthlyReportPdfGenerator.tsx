/* eslint-disable react-refresh/only-export-components -- PDF module exports the download helper next to its private layout primitives. */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { MonthlyReport } from "../api/reportsApi";

/* ---------------------------------------------------------------
 * Monthly performance report (A4, generated in the browser).
 *
 * Deliberately a working document, not a dashboard: summary numbers,
 * staff performance from the order trail, and EVERY order of the month
 * with its line items. No infographic charts.
 *
 * Like the QR sticker sheet there is no server-side PDF renderer —
 * `@react-pdf/renderer` builds the document client-side and the blob
 * is downloaded through a temporary anchor.
 * ---------------------------------------------------------------- */

const INK = "#142238";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const SOFT = "#f8fafc";
const ACCENT = "#4f46e5";

export interface MonthlyReportInput {
  report: MonthlyReport;
  /** Readable month label, e.g. "Aug 2026". */
  monthLabel: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string | null;
  /** Staff member triggering the download (shown in the footer). */
  generatedBy?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 46,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK,
    backgroundColor: "#ffffff",
  },
  topBar: {
    height: 5,
    backgroundColor: ACCENT,
    borderRadius: 3,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandBlock: { maxWidth: "62%" },
  brandName: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.2,
  },
  brandMeta: { fontSize: 7.5, color: MUTED, marginTop: 3, lineHeight: 1.4 },
  titleBlock: { alignItems: "flex-end" },
  reportTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  reportMonth: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginTop: 3,
  },
  reportMeta: { fontSize: 7.5, color: MUTED, marginTop: 3, textAlign: "right" },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 13 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 7,
  },
  kpiRow: { flexDirection: "row", gap: 6 },
  kpi: {
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SOFT,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  kpiLabel: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: MUTED,
  },
  kpiValue: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginTop: 3,
  },
  kpiHint: { fontSize: 6.2, color: MUTED, marginTop: 2 },
  section: { marginTop: 15 },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: INK },
  cardNote: { fontSize: 7, color: MUTED },
  tableHead: {
    flexDirection: "row",
    backgroundColor: SOFT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRowAlt: { backgroundColor: "#fcfdfe" },
  tableFoot: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: SOFT,
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  th: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: MUTED,
  },
  td: { fontSize: 7.2, color: INK },
  tdMuted: { fontSize: 7.2, color: MUTED },
  tdStrong: { fontSize: 7.2, fontFamily: "Helvetica-Bold", color: INK },
  tdItems: { fontSize: 6.6, color: INK, lineHeight: 1.25 },
  empty: { fontSize: 8, color: MUTED, paddingVertical: 8 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: MUTED, maxWidth: "76%" },
});

/**
 * Standard PDF fonts use WinAnsi encoding, which cannot encode glyphs such
 * as the rupee sign. Strip anything outside Latin-1 + common typographic
 * punctuation so a dish name can never break report generation.
 */
function safeText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u00B7]/g,
      "",
    )
    .trim();
}

function money(value: number | null | undefined): string {
  return `Rs. ${Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function count(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function changeLabel(value: number | null | undefined): string {
  const v = Number(value ?? 0);
  if (!Number.isFinite(v) || v === 0) return "Flat vs previous period";
  return `${v > 0 ? "+" : ""}${Math.round(v)}% vs previous period`;
}

function rangeText(since: string, until: string): string {
  const a = new Date(`${since}T00:00:00`);
  const b = new Date(`${until}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(a)} - ${fmt(b)}`;
}

function dayText(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateTimeText(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationText(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  if (value < 60) return `${Math.round(value)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
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

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{safeText(label)}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {hint ? <Text style={styles.kpiHint}>{safeText(hint)}</Text> : null}
    </View>
  );
}

function MetricRow({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <View style={styles.kpiRow}>
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </View>
  );
}

function TableHead({
  columns,
}: {
  columns: Array<{ label: string; width: string; align?: "right" }>;
}) {
  return (
    <View style={styles.tableHead}>
      {columns.map((column) => (
        <Text
          key={column.label}
          style={[
            styles.th,
            { width: column.width, textAlign: column.align ?? "left" },
          ]}
        >
          {safeText(column.label)}
        </Text>
      ))}
    </View>
  );
}

function StaffTableCard({
  title,
  note,
  columns,
  rows,
  empty,
}: {
  title: string;
  note: string;
  columns: Array<{ label: string; width: string; align?: "right" }>;
  rows: Array<Array<{ text: string; strong?: boolean }>>;
  empty: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardNote}>{note}</Text>
      </View>
      <TableHead columns={columns} />
      {rows.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : (
        rows.map((cells, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowAlt : {},
            ]}
            wrap={false}
          >
            {cells.map((cell, cellIndex) => (
              <Text
                key={cellIndex}
                style={[
                  cell.strong ? styles.tdStrong : styles.tdMuted,
                  {
                    width: columns[cellIndex].width,
                    textAlign: columns[cellIndex].align ?? "left",
                  },
                ]}
              >
                {safeText(cell.text)}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

/** Build the report document and download it. */
export async function downloadMonthlyReportPdf(
  input: MonthlyReportInput,
): Promise<void> {
  const { report, monthLabel, restaurantAddress, restaurantPhone } = input;
  const { stats, orders, staff, range } = report;

  const restaurantName = safeText(input.restaurantName) || "Restaurant";
  const address = safeText(restaurantAddress);
  const phone = safeText(restaurantPhone ?? "");
  const generatedBy = safeText(input.generatedBy ?? "");
  const generatedOn = new Date().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dineIn = stats.channelSplit.find((c) => c.key === "DINE_IN");
  const takeaway = stats.channelSplit.find((c) => c.key === "TAKEAWAY");
  const dineInRevenue = dineIn?.revenue ?? 0;
  const takeawayRevenue = takeaway?.revenue ?? 0;
  const totalOrderRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const admins = staff.filter((member) => member.role === "ADMIN");
  const captains = staff.filter((member) => member.role === "CAPTAIN");
  const chefs = staff.filter((member) => member.role === "CHEF");

  const summaryRows: Array<{ metric: string; value: string; note: string }> = [
    {
      metric: "Revenue",
      value: money(stats.revenue),
      note: changeLabel(stats.revenueChangePct),
    },
    {
      metric: "Orders",
      value: count(stats.orders),
      note: `${count(stats.completed)} completed - ${count(stats.cancelled)} cancelled`,
    },
    {
      metric: "Average order value",
      value: money(stats.avgOrderValue),
      note: "Per non-cancelled order",
    },
    {
      metric: "Completion rate",
      value: `${Math.round(stats.completionRate ?? 0)}%`,
      note: "Of closed orders",
    },
    {
      metric: "Previous period",
      value: money(stats.previousRevenue),
      note: `${count(stats.previousOrders)} orders`,
    },
    {
      metric: "Dine-in",
      value: `${count(dineIn?.orders ?? 0)} orders`,
      note: money(dineInRevenue),
    },
    {
      metric: "Takeaway",
      value: `${count(takeaway?.orders ?? 0)} orders`,
      note: money(takeawayRevenue),
    },
    {
      metric: "Best day",
      value: stats.bestDay ? dayText(stats.bestDay.key) : "-",
      note: stats.bestDay
        ? `${money(stats.bestDay.revenue)} - ${count(stats.bestDay.orders)} orders`
        : "No orders this month",
    },
    {
      metric: "Busiest hour",
      value: stats.peakHour?.label || "-",
      note: stats.peakHour
        ? `${money(stats.peakHour.revenue)} - ${count(stats.peakHour.orders)} orders`
        : "No orders this month",
    },
  ];

  const doc = (
    <Document
      title={`${restaurantName} - ${monthLabel} monthly report`}
      author="AharQR"
      subject={`Monthly report for ${monthLabel}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{restaurantName}</Text>
            <Text style={styles.brandMeta}>
              {[address, phone].filter(Boolean).join("\n") ||
                "AharQR partner restaurant"}
            </Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.reportTitle}>Monthly report</Text>
            <Text style={styles.reportMonth}>{safeText(monthLabel)}</Text>
            <Text style={styles.reportMeta}>
              {rangeText(range.since, range.until)}
              {"\n"}
              {range.days} {range.days === 1 ? "day" : "days"} of data
              {"\n"}
              {count(orders.length)} orders documented
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View wrap={false}>
          <Text style={styles.sectionTitle}>Headline performance</Text>
          <MetricRow
            items={[
              {
                label: "Revenue",
                value: money(stats.revenue),
                hint: changeLabel(stats.revenueChangePct),
              },
              {
                label: "Orders",
                value: count(stats.orders),
                hint: `${count(stats.completed)} completed`,
              },
              {
                label: "Avg order value",
                value: money(stats.avgOrderValue),
                hint: `${count(stats.cancelled)} cancelled`,
              },
              {
                label: "Completion rate",
                value: `${Math.round(stats.completionRate ?? 0)}%`,
                hint: "of closed orders",
              },
            ]}
          />
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Summary statistics</Text>
              <Text style={styles.cardNote}>
                {count(orders.length)} orders - {money(totalOrderRevenue)}{" "}
                non-cancelled
              </Text>
            </View>
            <TableHead
              columns={[
                { label: "Metric", width: "30%" },
                { label: "Value", width: "22%", align: "right" },
                { label: "Note", width: "48%" },
              ]}
            />
            {summaryRows.map((row, index) => (
              <View
                key={row.metric}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
                wrap={false}
              >
                <Text style={[styles.td, { width: "30%" }]}>
                  {safeText(row.metric)}
                </Text>
                <Text
                  style={[styles.tdStrong, { width: "22%", textAlign: "right" }]}
                >
                  {safeText(row.value)}
                </Text>
                <Text style={[styles.tdMuted, { width: "48%" }]}>
                  {safeText(row.note)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff performance by role</Text>

          <StaffTableCard
            title="Admin performance"
            note={`${count(admins.length)} admin${admins.length === 1 ? "" : "s"} - full order pipeline and revenue settlement`}
            columns={[
              { label: "Admin", width: "24%" },
              { label: "Created", width: "10%", align: "right" },
              { label: "Accepted", width: "9%", align: "right" },
              { label: "Prepared", width: "9%", align: "right" },
              { label: "Served", width: "9%", align: "right" },
              { label: "Completed", width: "10%", align: "right" },
              { label: "Cancelled", width: "9%", align: "right" },
              { label: "Revenue", width: "20%", align: "right" },
            ]}
            rows={admins.map((member) => [
              { text: member.name || "Admin", strong: true },
              { text: count(member.ordersCreated) },
              { text: count(member.ordersAccepted) },
              { text: count(member.ordersPrepared) },
              { text: count(member.ordersServed) },
              { text: count(member.ordersCompleted) },
              { text: count(member.ordersCancelled) },
              { text: money(member.revenueHandled) },
            ])}
            empty="No admin activity recorded this month."
          />

          <View style={{ height: 8 }} />

          <StaffTableCard
            title="Captain performance"
            note={`${count(captains.length)} captain${captains.length === 1 ? "" : "s"} - order taking, serving and completion`}
            columns={[
              { label: "Captain", width: "26%" },
              { label: "Created", width: "11%", align: "right" },
              { label: "Served", width: "10%", align: "right" },
              { label: "Completed", width: "11%", align: "right" },
              { label: "Cancelled", width: "10%", align: "right" },
              { label: "Avg serve", width: "12%", align: "right" },
              { label: "Revenue", width: "20%", align: "right" },
            ]}
            rows={captains.map((member) => [
              { text: member.name || "Captain", strong: true },
              { text: count(member.ordersCreated) },
              { text: count(member.ordersServed) },
              { text: count(member.ordersCompleted) },
              { text: count(member.ordersCancelled) },
              { text: durationText(member.avgServeSeconds) },
              { text: money(member.revenueHandled) },
            ])}
            empty="No captain activity recorded this month."
          />

          <View style={{ height: 8 }} />

          <StaffTableCard
            title="Chef performance"
            note={`${count(chefs.length)} chef${chefs.length === 1 ? "" : "s"} - kitchen acceptance, cooking output and cancellations`}
            columns={[
              { label: "Chef", width: "30%" },
              { label: "Accepted", width: "13%", align: "right" },
              { label: "Prepared", width: "13%", align: "right" },
              { label: "Items cooked", width: "14%", align: "right" },
              { label: "Avg cook", width: "15%", align: "right" },
              { label: "Cancelled", width: "15%", align: "right" },
            ]}
            rows={chefs.map((member) => [
              { text: member.name || "Chef", strong: true },
              { text: count(member.ordersAccepted) },
              { text: count(member.ordersPrepared) },
              { text: count(member.itemsPrepared) },
              { text: durationText(member.avgPrepSeconds) },
              { text: count(member.ordersCancelled) },
            ])}
            empty="No chef activity recorded this month."
          />
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>All orders</Text>
              <Text style={styles.cardNote}>
                {count(orders.length)} orders - {money(totalOrderRevenue)}{" "}
                non-cancelled revenue
              </Text>
            </View>
            <TableHead
              columns={[
                { label: "Date", width: "10%" },
                { label: "Order #", width: "11%" },
                { label: "Type", width: "7%" },
                { label: "Table", width: "12%" },
                { label: "Customer", width: "12%" },
                { label: "Items", width: "25%" },
                { label: "Status", width: "10%" },
                { label: "Pay", width: "5%" },
                { label: "Total", width: "8%", align: "right" },
              ]}
            />
            {orders.length === 0 ? (
              <Text style={styles.empty}>No orders recorded this month.</Text>
            ) : (
              orders.map((order, index) => {
                const table =
                  order.orderType === "TAKEAWAY"
                    ? "Takeaway"
                    : order.tableNumber
                      ? `#${order.tableNumber}${order.tableName ? ` - ${order.tableName}` : ""}`
                      : "-";
                const customer =
                  order.customerName ||
                  (order.createdByType === "CUSTOMER_QR" ? "Guest" : "Walk-in");
                const items =
                  order.items
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ") || "-";
                return (
                  <View
                    key={order.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                    wrap={false}
                  >
                    <Text style={[styles.tdMuted, { width: "10%" }]}>
                      {safeText(dateTimeText(order.createdAt))}
                    </Text>
                    <Text style={[styles.td, { width: "11%" }]}>
                      {safeText(order.orderNumber)}
                    </Text>
                    <Text style={[styles.tdMuted, { width: "7%" }]}>
                      {order.orderType === "TAKEAWAY" ? "Takeaway" : "Dine-in"}
                    </Text>
                    <Text style={[styles.tdMuted, { width: "12%" }]}>
                      {safeText(table)}
                    </Text>
                    <Text style={[styles.tdMuted, { width: "12%" }]}>
                      {safeText(customer)}
                    </Text>
                    <Text style={[styles.tdItems, { width: "25%" }]}>
                      {safeText(items)}
                    </Text>
                    <Text style={[styles.tdMuted, { width: "10%" }]}>
                      {safeText(statusLabel(order.status))}
                    </Text>
                    <Text style={[styles.tdMuted, { width: "5%" }]}>
                      {safeText(statusLabel(order.paymentStatus))}
                    </Text>
                    <Text
                      style={[
                        styles.tdStrong,
                        { width: "8%", textAlign: "right" },
                      ]}
                    >
                      {money(order.totalAmount)}
                    </Text>
                  </View>
                );
              })
            )}
            <View style={styles.tableFoot} wrap={false}>
              <Text style={[styles.td, { width: "70%" }]}>
                Total (non-cancelled revenue)
              </Text>
              <Text
                style={[styles.tdStrong, { width: "30%", textAlign: "right" }]}
              >
                {money(totalOrderRevenue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Top dishes</Text>
              <Text style={styles.cardNote}>
                {count(stats.topDishes.length)} dishes ranked by revenue
              </Text>
            </View>
            <TableHead
              columns={[
                { label: "#", width: "6%" },
                { label: "Dish", width: "56%" },
                { label: "Qty sold", width: "14%", align: "right" },
                { label: "Revenue", width: "24%", align: "right" },
              ]}
            />
            {stats.topDishes.length === 0 ? (
              <Text style={styles.empty}>
                Dish sales appear once orders are accepted.
              </Text>
            ) : (
              stats.topDishes.map((dish, index) => (
                <View
                  key={`${dish.name}-${index}`}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <Text style={[styles.tdMuted, { width: "6%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.td, { width: "56%" }]}>
                    {safeText(dish.name) || "-"}
                  </Text>
                  <Text
                    style={[styles.tdMuted, { width: "14%", textAlign: "right" }]}
                  >
                    {count(dish.quantity)}
                  </Text>
                  <Text
                    style={[styles.tdStrong, { width: "24%", textAlign: "right" }]}
                  >
                    {money(dish.revenue)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            {[
              "AharQR monthly report",
              generatedBy ? `by ${generatedBy}` : "",
              `generated ${generatedOn}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug =
    safeText(monthLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    "monthly-report";
  link.href = url;
  link.download = `aharqr-report-${slug}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
