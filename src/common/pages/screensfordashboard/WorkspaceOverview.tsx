import { useMemo, useState } from "react";
import {
  Activity,
  CalendarRange,
  ClipboardList,
  Download,
  Loader2,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  EmptyState,
  MonthSelector,
  SectionTitle,
  monthKey,
  monthLabel,
  monthsBetween,
} from "../../components";
import { DashboardTabSkeleton } from "../../components/loaders";
import {
  DonutChart,
  RowBars,
  VerticalBars,
  formatINR,
} from "../../components/charts";
import { useDashboardAnalytics } from "../../../hooks/use-reports";
import { useMyRestaurant } from "../../../hooks/use-my-restaurant";
import { formatRestaurantAddress } from "../../../hooks/use-restaurant";
import { useAuthStore } from "../../../stores/auth-store";

const ACCENT = "var(--accent-600)";
const ACCENT2 = "var(--accent2-600)";
const ZINC = "#a1a1aa";

function dayLabel(key: string, compact: boolean): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  if (compact) return String(d.getDate());
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function rangeLabel(since: string, until: string): string {
  const a = new Date(`${since}T00:00:00`);
  const b = new Date(`${until}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const fmt = (d: Date, month: boolean) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      ...(month ? { month: "short" as const } : {}),
    });
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${b.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${fmt(a, true)} – ${fmt(b, true)} ${b.getFullYear()}`;
}

function deltaHint(value: number | undefined, label = "previous period"): string {
  const v = value ?? 0;
  if (v === 100 && (value ?? 0) > 0) return `+100% vs ${label}`;
  if (v > 0) return `+${v}% vs ${label}`;
  if (v < 0) return `${v}% vs ${label}`;
  return `Flat vs ${label}`;
}

function OverviewMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="truncate text-[10px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-base leading-tight font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 truncate text-[10px] text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

/**
 * Shared analytics dashboard — the landing tab of every staff workspace.
 * Calendar-month view with a horizontal month rail from the restaurant's
 * registration month to today.
 */
export function WorkspaceOverview() {
  const { data: restaurant } = useMyRestaurant();
  const user = useAuthStore((s) => s.user);
  /** Monthly PDF report is a management document — admins only. */
  const canDownloadReport = user?.role === "ADMIN";
  const [downloading, setDownloading] = useState(false);
  const currentMonth = monthKey(new Date());

  const months = (() => {
    const fallback = new Date();
    const created = restaurant?.createdAt ? new Date(restaurant.createdAt) : null;
    const from =
      created && !Number.isNaN(created.getTime()) ? created : fallback;
    return monthsBetween(from, fallback);
  })();

  // `null` means "follow the latest month"; an explicit pick is used only while
  // it still exists in the rail (e.g. after restaurant data loads).
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const month =
    selectedMonth && months.includes(selectedMonth)
      ? selectedMonth
      : (months[months.length - 1] ?? currentMonth);

  const { data, isLoading, error, refetch, isRefetching } =
    useDashboardAnalytics(month);
  const k = data?.kpis;
  const isCurrentMonth = month === currentMonth;

  const bestDay = useMemo(() => {
    const trend = data?.salesTrend ?? [];
    return trend.reduce(
      (best, point) => (point.revenue > best.revenue ? point : best),
      { key: "", revenue: 0, orders: 0 },
    );
  }, [data?.salesTrend]);

  /**
   * Build the monthly report PDF in the browser (same approach as the table
   * QR sticker sheet) from the analytics already loaded for this month.
   */
  async function downloadReport() {
    if (!data) return;
    setDownloading(true);
    try {
      const { downloadMonthlyReportPdf } = await import(
        "../../../utils/monthlyReportPdfGenerator"
      );
      await downloadMonthlyReportPdf({
        data,
        monthLabel: monthLabel(month),
        restaurantName: restaurant?.name ?? "Restaurant",
        restaurantAddress: formatRestaurantAddress(restaurant ?? {}),
        restaurantPhone: restaurant?.phone,
        generatedBy: [user?.firstName, user?.lastName]
          .filter(Boolean)
          .join(" "),
      });
      toast.success("Monthly report downloaded");
    } catch {
      toast.error("Could not generate the report PDF");
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading && !data)
    return (
      <DashboardTabSkeleton
        label="Loading dashboard overview"
        variant="overview"
      />
    );

  if (error && !data) {
    return (
      <EmptyState
        title="Analytics unavailable"
        description="We couldn't load the dashboard analytics right now."
        action={
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        }
      />
    );
  }

  const salesTrend =
    data?.salesTrend.map((p) => ({
      key: p.key,
      label: dayLabel(p.key, (data?.range.days ?? 31) > 14),
      value: p.revenue,
      sub: p.orders,
    })) ?? [];

  const hourData =
    data?.revenueByHour.map((h) => ({
      key: String(h.hour),
      label: h.label,
      value: h.revenue,
      sub: h.orders,
    })) ?? [];

  const sourceSegments = (data?.sourceSplit ?? []).map((s) => ({
    label: s.label,
    value: s.orders,
    color:
      s.key === "CUSTOMER_SELF"
        ? ACCENT2
        : s.key === "CAPTAIN"
          ? ACCENT
          : ZINC,
  }));

  const closed = (k?.completed ?? 0) + (k?.cancelled ?? 0);
  const dine = data?.channelSplit.find((c) => c.key === "DINE_IN");
  const takeaway = data?.channelSplit.find((c) => c.key === "TAKEAWAY");

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Month rail — registration month → current month */}
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white/90 p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 md:flex-row md:items-center md:justify-between md:px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
            <CalendarRange size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {monthLabel(month)}
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              {data
                ? `${rangeLabel(data.range.since, data.range.until)} · ${data.range.days} ${
                    data.range.days === 1 ? "day" : "days"
                  } of data`
                : "Monthly performance"}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 md:flex-1 md:justify-end">
          <MonthSelector
            months={months}
            value={month}
            onChange={setSelectedMonth}
            className="min-w-0 flex-1 md:max-w-[min(56%,40rem)]"
          />
          {canDownloadReport && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void downloadReport()}
              loading={downloading}
              loadingText="Building…"
              disabled={!data}
              title={`Download the ${monthLabel(month)} report as PDF`}
              aria-label="Download monthly report as PDF"
              className="shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* Headline KPIs */}
      <section className="space-y-1.5">
        <p className="px-0.5 text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase">
          Monthly performance
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <OverviewMetric
          label={`Revenue (${monthLabel(month).split(" ")[0]})`}
          value={formatINR(k?.revenue ?? 0)}
          hint={deltaHint(k?.revenueChangePct)}
          />
          <OverviewMetric
          label="Orders"
          value={(k?.orders ?? 0).toLocaleString("en-IN")}
          hint={`${closed} closed · ${
            k?.avgOrderValue ? formatINR(k.avgOrderValue) : "₹0"
          } avg`}
          />
          {isCurrentMonth ? (
            <OverviewMetric
            label="Today's sales"
            value={formatINR(k?.todayRevenue ?? 0)}
            hint={`${k?.todayOrders ?? 0} orders so far`}
            />
          ) : (
            <OverviewMetric
            label="Best day"
            value={formatINR(bestDay.revenue)}
            hint={
              bestDay.key
                ? `${dayLabel(bestDay.key, false)} · ${bestDay.orders} orders`
                : "No orders this month"
            }
            />
          )}
          <OverviewMetric
          label="Completion rate"
          value={k ? `${Math.round(k.completionRate)}%` : "—"}
          hint={k ? `${k.cancelled} cancelled` : undefined}
          />
        </div>
      </section>

      {/* Live floor stats */}
      <section className="space-y-1.5">
        <p className="px-0.5 text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase">
          Live operations
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          <OverviewMetric label="Active orders" value={k?.activeOrders ?? "—"} />
          <OverviewMetric
          label="Tables open"
          value={k?.totalTables ? `${k.openTables}/${k.totalTables}` : "—"}
          hint="Occupied / total"
          />
          <OverviewMetric label="Team" value={k?.staffTotal ?? "—"} hint="Members" />
          <OverviewMetric
          label="Dine-in"
          value={`${dine?.orders ?? 0} orders`}
          hint={formatINR(dine?.revenue ?? 0)}
          />
          <OverviewMetric
          label="Takeaway"
          value={`${takeaway?.orders ?? 0} orders`}
          hint={formatINR(takeaway?.revenue ?? 0)}
          />
        </div>
      </section>

      {/* Sales trend + order sources */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                <TrendingUp size={15} />
              </span>
              <SectionTitle>Sales trend</SectionTitle>
            </div>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {formatINR(k?.revenue ?? 0)}
            </span>
          </div>
          <VerticalBars
            items={salesTrend}
            height={200}
            maxLabelEvery={(data?.range.days ?? 31) > 14 ? 5 : 1}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent2-50 text-accent2-600 dark:bg-accent2-500/15 dark:text-accent2-300">
              <Activity size={15} />
            </span>
            <SectionTitle>Order sources</SectionTitle>
          </div>
          <DonutChart
            segments={sourceSegments}
            centerValue={(k?.orders ?? 0).toLocaleString("en-IN")}
            centerLabel="orders"
          />
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <RowBars
              rows={
                data?.sourceSplit.map((s) => ({
                  key: s.key,
                  label: s.label,
                  value: s.revenue,
                  color:
                    s.key === "CUSTOMER_SELF"
                      ? ACCENT2
                      : s.key === "CAPTAIN"
                        ? ACCENT
                        : ZINC,
                })) ?? []
              }
              format={formatINR}
            />
          </div>
        </Card>
      </div>

      {/* Hourly revenue + top dishes */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent2-50 text-accent2-600 dark:bg-accent2-500/15 dark:text-accent2-300">
              <ClipboardList size={15} />
            </span>
            <SectionTitle>Revenue by hour</SectionTitle>
          </div>
          <VerticalBars
            items={hourData}
            height={180}
            color={ACCENT2}
            maxLabelEvery={3}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
              <TrendingUp size={15} />
            </span>
            <SectionTitle>Top dishes</SectionTitle>
          </div>
          {(data?.topDishes.length ?? 0) > 0 ? (
            <RowBars
              rows={
                data!.topDishes.map((d) => ({
                  key: d.name,
                  label: d.name,
                  value: d.quantity,
                  color: ACCENT,
                })) ?? []
              }
              subtitle={(row) => (
                <span className="text-xs text-zinc-400">
                  {formatINR(
                    (data?.topDishes ?? []).find((d) => d.name === row.label)
                      ?.revenue ?? 0,
                  )}
                </span>
              )}
              format={(n) => `${n} pcs`}
            />
          ) : (
            <EmptyState
              title="No dishes yet"
              description="Dish sales appear here once orders are accepted."
            />
          )}
        </Card>
      </div>

      {isRefetching && (
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 size={13} className="animate-spin" /> Refreshing live data…
        </p>
      )}
    </div>
  );
}
