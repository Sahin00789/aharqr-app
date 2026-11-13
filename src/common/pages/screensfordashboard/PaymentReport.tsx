import { useMemo, useState, type ReactNode } from "react";
import { Banknote, CalendarRange, CreditCard, Receipt } from "lucide-react";
import {
  Badge,
  Card,
  DashboardTabSkeleton,
  DaySelector,
  MonthSelector,
  SectionTitle,
  StatCard,
  dayPillLabel,
  monthKey,
  monthLabel,
  monthsBetween,
} from "../../components";
import { BillButton } from "../../components/BillModal";
import type { PaymentDayPoint } from "../../../api/financeApi";
import type { StaffOrder } from "../../../api/ordersApi";
import { usePaymentAnalytics } from "../../../hooks/use-finance";
import { useStaffOrders } from "../../../hooks/use-orders";
import { useMyRestaurant } from "../../../hooks/use-my-restaurant";

const EMPTY_DAILY: PaymentDayPoint[] = [];

/** Sentinel key for the leading "all month" pill in the day rail. */
const ALL_DAYS = "ALL";

/** Money with paise when present (₹452.5 stays ₹452.5). */
function inr(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function share(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

function formatTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function rangeLabel(since: string, until: string): string {
  const a = new Date(`${since}T00:00:00`);
  const b = new Date(`${until}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const sameMonth =
    a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth
    ? `${a.getDate()}–${b.getDate()} ${b.toLocaleDateString("en-IN", { month: "short" })}`
    : `${a.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${b.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

/** Map a staff order onto the bill modal payload. */
function toBill(order: StaffOrder) {
  return {
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    customerName: order.customerName,
    status: order.status,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    })),
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    gstRate: order.gstRate,
    showTaxBreakdown: order.showTaxBreakdown,
    taxMode: order.taxMode,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  };
}

/**
 * Shared payment report for admin Finance and captain Payments: a month rail
 * (scrolling `SEP2026` pills) drives order/item counts and money collected by
 * method, while the `13 Fri Nov` day rail (with an all-month pill) lists the
 * payments — each with its bill and a role-specific trail trigger.
 */
export function PaymentReport({
  renderTrail,
}: {
  /** Role-specific trail trigger rendered next to each payment's bill button. */
  renderTrail?: (order: StaffOrder) => ReactNode;
}) {
  const { data: restaurant } = useMyRestaurant();
  const currentMonth = monthKey(new Date());

  const months = useMemo(() => {
    const created = restaurant?.createdAt ? new Date(restaurant.createdAt) : null;
    const from =
      created && !Number.isNaN(created.getTime()) ? created : new Date();
    return monthsBetween(from, new Date());
  }, [restaurant]);

  // `null` follows the latest month; an explicit pick survives only while the
  // month still exists in the rail.
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const month =
    selectedMonth && months.includes(selectedMonth)
      ? selectedMonth
      : (months[months.length - 1] ?? currentMonth);

  const { data, isLoading, error, refetch } = usePaymentAnalytics(month);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Payments link back to their order so the row can open the bill + trail.
  const { data: orders = [] } = useStaffOrders();
  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  const daily = data?.daily ?? EMPTY_DAILY;
  const totals = data?.totals;

  const activeDay =
    selectedDay === ALL_DAYS ||
    (selectedDay && daily.some((point) => point.date === selectedDay))
      ? selectedDay
      : ALL_DAYS;
  const dayPoint =
    activeDay && activeDay !== ALL_DAYS
      ? daily.find((point) => point.date === activeDay)
      : undefined;
  const dayPayments = useMemo(
    () =>
      activeDay === ALL_DAYS
        ? (data?.payments ?? [])
        : (data?.payments ?? []).filter(
            (payment) => payment.day === activeDay,
          ),
    [data?.payments, activeDay],
  );

  /** Numbers for the selected day, or the whole month on the "all" pill. */
  const activeTotals =
    activeDay === ALL_DAYS
      ? {
          earned: totals?.earned ?? 0,
          orders: totals?.successOrders ?? 0,
          items: totals?.items ?? 0,
          paymentCount: totals?.paymentCount ?? 0,
        }
      : {
          earned: dayPoint?.earned ?? 0,
          orders: dayPoint?.orders ?? 0,
          items: dayPoint?.items ?? 0,
          paymentCount: dayPoint?.paymentCount ?? 0,
        };
  const activeLabel =
    activeDay === ALL_DAYS ? "all month" : dayPillLabel(activeDay ?? "");

  if (isLoading && !data) {
    return <DashboardTabSkeleton label="Loading payments" variant="overview" />;
  }

  if (error && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We couldn't load the payment report right now.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-3">
      {/* Month rail — title on top, scrolling SEP2026 pills full width below */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
            <CalendarRange size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {monthLabel(month)}
            </p>
            <p className="truncate text-[10px] text-zinc-400">
              {data
                ? `${rangeLabel(data.range.since, data.range.until)} · ${data.range.days} ${
                    data.range.days === 1 ? "day" : "days"
                  } of payments`
                : "Payments collected by day"}
            </p>
          </div>
        </div>
        <MonthSelector
          months={months}
          value={month}
          onChange={setSelectedMonth}
          compact
          className="mt-2"
        />
      </div>

      {/* Month KPIs — compact one-liners */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-5">
        <StatCard
          compact
          label="Orders"
          value={(totals?.successOrders ?? 0).toLocaleString("en-IN")}
          hint={`${totals?.cancelledOrders ?? 0} cancelled`}
        />
        <StatCard
          compact
          label="Items"
          value={(totals?.items ?? 0).toLocaleString("en-IN")}
          hint="sold"
        />
        <StatCard
          compact
          tone="green"
          label="Earned"
          value={inr(totals?.earned ?? 0)}
          hint={`${totals?.paymentCount ?? 0} collected`}
        />
        <StatCard
          compact
          label="UPI"
          value={inr(totals?.upi ?? 0)}
          hint={share(totals?.upi ?? 0, totals?.earned ?? 0)}
        />
        <StatCard
          compact
          label="Cash"
          value={inr(totals?.cash ?? 0)}
          hint={share(totals?.cash ?? 0, totals?.earned ?? 0)}
        />
      </div>

      <p className="px-0.5 text-[10px] text-zinc-400">
        {inr(totals?.billed ?? 0)} billed ·{" "}
        {inr(totals?.unpaidAmount ?? 0)} unpaid ·{" "}
        {inr(totals?.avgOrderValue ?? 0)} avg order
        {(totals?.bankTransfer ?? 0) > 0
          ? ` · bank ${inr(totals?.bankTransfer ?? 0)}`
          : ""}
      </p>

      {/* Day rail + payments in one compact card */}
      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
          <SectionTitle>Payments</SectionTitle>
          <span className="text-[10px] font-medium text-zinc-400">
            {activeTotals.paymentCount}{" "}
            {activeTotals.paymentCount === 1 ? "payment" : "payments"} ·{" "}
            {activeLabel}
          </span>
        </div>

        <div className="border-b border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
          <DaySelector
            days={[
              { key: ALL_DAYS, rows: ["ALL", "MONTH", "TOTAL"], hasData: false },
              ...daily.map((point) => ({
                key: point.date,
                hasData: point.paymentCount > 0,
              })),
            ]}
            value={activeDay}
            onChange={setSelectedDay}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>
            Earned{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {inr(activeTotals.earned)}
            </strong>
          </span>
          <span>
            Orders{" "}
            <strong className="text-zinc-800 dark:text-zinc-100">
              {activeTotals.orders}
            </strong>
          </span>
          <span>
            Items{" "}
            <strong className="text-zinc-800 dark:text-zinc-100">
              {activeTotals.items}
            </strong>
          </span>
        </div>

        {dayPayments.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {activeDay === ALL_DAYS
              ? "No payments collected this month."
              : `No payments collected on ${dayPillLabel(activeDay ?? "")}.`}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {dayPayments.map((payment) => {
              const order = payment.orderId
                ? ordersById.get(payment.orderId)
                : undefined;
              return (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-3 py-2 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {payment.method === "UPI" ? (
                      <CreditCard size={14} />
                    ) : payment.method === "CASH" ? (
                      <Banknote size={14} />
                    ) : (
                      <Receipt size={14} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        {payment.orderNumber
                          ? `#${payment.orderNumber}`
                          : "Payment"}
                      </p>
                      <Badge
                        tone={
                          payment.method === "UPI"
                            ? "indigo"
                            : payment.method === "CASH"
                              ? "green"
                              : "zinc"
                        }
                      >
                        {payment.methodLabel}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                      {formatTime(payment.paidAt)}
                      {payment.orderType === "DINE_IN"
                        ? ` · Dine-in${payment.tableNumber ? ` · T${payment.tableNumber}` : ""}`
                        : payment.orderType === "TAKEAWAY"
                          ? " · Takeaway"
                          : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {inr(payment.amount)}
                  </span>

                  {order && (
                    <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                      <BillButton
                        iconOnly
                        bill={toBill(order)}
                        label={`Bill ${order.orderNumber}`}
                      />
                      {renderTrail?.(order)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
