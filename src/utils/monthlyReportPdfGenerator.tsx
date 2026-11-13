/* eslint-disable react-refresh/only-export-components -- PDF module exports the download helper next to its private layout primitives. */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { DashboardAnalytics } from "../api/reportsApi";

/* ---------------------------------------------------------------
 * Monthly performance report (A4, generated in the browser).
 * Mirrors the admin "Monthly Overview" tab: KPI cards, sales trend,
 * order sources, channel mix, revenue by hour and top dishes.
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
const ACCENT2 = "#059669";

export interface MonthlyReportInput {
  data: DashboardAnalytics;
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
  chartArea: {
    height: 96,
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  barCell: {
    height: 96,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "60%",
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },
  axisRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 3,
    paddingTop: 3,
  },
  axisCell: { alignItems: "center" },
  axisLabel: { fontSize: 5.2, color: MUTED },
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
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableFoot: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: SOFT,
    borderRadius: 4,
  },
  th: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: MUTED,
  },
  td: { fontSize: 8, color: INK },
  tdMuted: { fontSize: 8, color: MUTED },
  tdStrong: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK },
  empty: { fontSize: 8, color: MUTED, paddingVertical: 8 },
  twoCol: { flexDirection: "row", gap: 10 },
  halfCard: { flexGrow: 1, flexBasis: 0 },
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

function share(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
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

function dayLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return String(d.getDate());
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

function BarChart({
  items,
  color,
  labelEvery,
}: {
  items: Array<{ label: string; value: number; sub?: number }>;
  color: string;
  labelEvery: number;
}) {
  const peak = Math.max(...items.map((item) => item.value), 0) || 1;
  const width = `${100 / Math.max(items.length, 1)}%`;

  if (items.length === 0) {
    return <Text style={styles.empty}>No activity recorded for this period.</Text>;
  }

  return (
    <View wrap={false}>
      <View style={styles.chartArea}>
        {items.map((item, index) => (
          <View
            key={`${item.label}-${index}`}
            style={[styles.barCell, { width }]}
          >
            <View
              style={[
                styles.bar,
                {
                  backgroundColor: color,
                  height: Math.max(2, Math.round((item.value / peak) * 92)),
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.axisRow}>
        {items.map((item, index) => (
          <View
            key={`axis-${item.label}-${index}`}
            style={[styles.axisCell, { width }]}
          >
            <Text style={styles.axisLabel}>
              {index % labelEvery === 0 ? safeText(item.label) : ""}
            </Text>
          </View>
        ))}
      </View>
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

/** Build the report document and download it. */
export async function downloadMonthlyReportPdf(
  input: MonthlyReportInput,
): Promise<void> {
  const { data, monthLabel, restaurantAddress, restaurantPhone } = input;
  const { kpis: k, range } = data;

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

  const revenue = k.revenue ?? 0;
  const orders = k.orders ?? 0;

  const peakDay = data.salesTrend.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    { key: "", revenue: 0, orders: 0 },
  );

  const dineIn = data.channelSplit.find((c) => c.key === "DINE_IN");
  const takeaway = data.channelSplit.find((c) => c.key === "TAKEAWAY");
  const channelRows = [dineIn, takeaway].filter(
    (row): row is NonNullable<typeof row> => Boolean(row),
  );

  const topDishRevenue = data.topDishes.reduce(
    (sum, dish) => sum + dish.revenue,
    0,
  );

  const doc = (
    <Document
      title={`${restaurantName} - ${monthLabel} monthly report`}
      author="AharQR"
      subject={`Monthly performance report for ${monthLabel}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{restaurantName}</Text>
            <Text style={styles.brandMeta}>
              {[address, phone].filter(Boolean).join("\n") || "AharQR partner restaurant"}
            </Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.reportTitle}>Monthly performance report</Text>
            <Text style={styles.reportMonth}>{safeText(monthLabel)}</Text>
            <Text style={styles.reportMeta}>
              {rangeText(range.since, range.until)}
              {"\n"}
              {range.days} {range.days === 1 ? "day" : "days"} of data
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
                value: money(revenue),
                hint: changeLabel(k.revenueChangePct),
              },
              {
                label: "Orders",
                value: count(orders),
                hint: `${count(k.completed)} completed`,
              },
              {
                label: "Avg order value",
                value: money(k.avgOrderValue),
                hint: `${count(k.cancelled)} cancelled`,
              },
              {
                label: "Completion rate",
                value: `${Math.round(k.completionRate ?? 0)}%`,
                hint: "of closed orders",
              },
            ]}
          />
          <View style={{ height: 6 }} />
          <MetricRow
            items={[
              {
                label: "Previous period",
                value: money(k.previousRevenue),
                hint: `${count(k.previousOrders)} orders`,
              },
              {
                label: "Today's sales",
                value: money(k.todayRevenue),
                hint: `${count(k.todayOrders)} orders so far`,
              },
              {
                label: "Tables open",
                value: k.totalTables
                  ? `${count(k.openTables)}/${count(k.totalTables)}`
                  : "-",
                hint: "Occupied / total",
              },
              {
                label: "Team",
                value: count(k.staffTotal),
                hint: "Active members",
              },
            ]}
          />
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sales trend</Text>
              <Text style={styles.cardNote}>
                {peakDay.key
                  ? `Peak day ${safeText(dayLabel(peakDay.key))} - ${money(
                      peakDay.revenue,
                    )} (${count(peakDay.orders)} orders)`
                  : "No orders this period"}
              </Text>
            </View>
            <BarChart
              items={data.salesTrend.map((point) => ({
                label: dayLabel(point.key),
                value: point.revenue,
                sub: point.orders,
              }))}
              color={ACCENT}
              labelEvery={data.salesTrend.length > 14 ? 5 : 1}
            />
          </View>
        </View>

        <View style={[styles.section, styles.twoCol]} wrap={false}>
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Order sources</Text>
              <Text style={styles.cardNote}>{count(orders)} orders</Text>
            </View>
            <TableHead
              columns={[
                { label: "Source", width: "46%" },
                { label: "Orders", width: "18%", align: "right" },
                { label: "Revenue", width: "36%", align: "right" },
              ]}
            />
            {data.sourceSplit.length === 0 ? (
              <Text style={styles.empty}>No orders recorded.</Text>
            ) : (
              data.sourceSplit.map((source) => (
                <View key={source.key} style={styles.tableRow}>
                  <Text style={[styles.td, { width: "46%" }]}>
                    {safeText(source.label)}
                  </Text>
                  <Text style={[styles.tdMuted, { width: "18%", textAlign: "right" }]}>
                    {count(source.orders)}
                  </Text>
                  <Text style={[styles.tdStrong, { width: "36%", textAlign: "right" }]}>
                    {money(source.revenue)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Dine-in vs takeaway</Text>
              <Text style={styles.cardNote}>{money(revenue)} total</Text>
            </View>
            <TableHead
              columns={[
                { label: "Channel", width: "34%" },
                { label: "Orders", width: "20%", align: "right" },
                { label: "Revenue", width: "30%", align: "right" },
                { label: "Share", width: "16%", align: "right" },
              ]}
            />
            {channelRows.length === 0 ? (
              <Text style={styles.empty}>No orders recorded.</Text>
            ) : (
              channelRows.map((channel) => (
                <View key={channel.key} style={styles.tableRow}>
                  <Text style={[styles.td, { width: "34%" }]}>
                    {safeText(channel.label)}
                  </Text>
                  <Text style={[styles.tdMuted, { width: "20%", textAlign: "right" }]}>
                    {count(channel.orders)}
                  </Text>
                  <Text style={[styles.tdStrong, { width: "30%", textAlign: "right" }]}>
                    {money(channel.revenue)}
                  </Text>
                  <Text style={[styles.tdMuted, { width: "16%", textAlign: "right" }]}>
                    {share(channel.revenue, revenue)}
                  </Text>
                </View>
              ))
            )}
            <View style={styles.tableFoot}>
              <Text style={[styles.td, { width: "34%" }]}>Avg order value</Text>
              <Text style={[styles.tdStrong, { width: "66%", textAlign: "right" }]}>
                {money(k.avgOrderValue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Revenue by hour</Text>
              <Text style={styles.cardNote}>All orders in the period</Text>
            </View>
            <BarChart
              items={data.revenueByHour.map((hour) => ({
                label: hour.label,
                value: hour.revenue,
                sub: hour.orders,
              }))}
              color={ACCENT2}
              labelEvery={3}
            />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Top dishes</Text>
              <Text style={styles.cardNote}>
                {money(topDishRevenue)} from {data.topDishes.length} dishes
              </Text>
            </View>
            <TableHead
              columns={[
                { label: "#", width: "7%" },
                { label: "Dish", width: "51%" },
                { label: "Qty sold", width: "16%", align: "right" },
                { label: "Revenue", width: "26%", align: "right" },
              ]}
            />
            {data.topDishes.length === 0 ? (
              <Text style={styles.empty}>
                Dish sales appear once orders are accepted.
              </Text>
            ) : (
              data.topDishes.map((dish, index) => (
                <View key={`${dish.name}-${index}`} style={styles.tableRow}>
                  <Text style={[styles.tdMuted, { width: "7%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.td, { width: "51%" }]}>
                    {safeText(dish.name) || "-"}
                  </Text>
                  <Text style={[styles.tdMuted, { width: "16%", textAlign: "right" }]}>
                    {count(dish.quantity)}
                  </Text>
                  <Text style={[styles.tdStrong, { width: "26%", textAlign: "right" }]}>
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
