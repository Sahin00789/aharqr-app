import { useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  ChartNoAxesColumn,
  ClipboardList,
  Clock,
  RotateCw,
  Trophy,
  Utensils,
  Wallet,
} from "lucide-react";
import { SecondaryScreenAdapter } from "../../layouts/SecondaryScreenAdapter";
import {
  Badge,
  EmptyState,
  MonthSelector,
  SectionTitle,
  StatCard,
  monthKey,
  monthLabel,
  monthsBetween,
} from "../../components";
import { formatINR } from "../../components/charts";
import { formatDuration } from "../../../api/ordersApi";
import type { MonthlyStaffPerformance } from "../../../api/reportsApi";
import { useMyRestaurant } from "../../../hooks/use-my-restaurant";
import { reportsKeys, usePerformanceReport } from "../../../hooks/use-reports";
import { useAuthStore } from "../../../stores/auth-store";
import type { UserRole } from "../../../types";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CAPTAIN: "Captain",
  CHEF: "Chef",
};

const ROLE_TONE: Record<string, "indigo" | "green" | "amber" | "zinc"> = {
  ADMIN: "indigo",
  CAPTAIN: "green",
  CHEF: "amber",
};

interface LeaderColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (member: MonthlyStaffPerformance) => ReactNode;
}

interface LeaderboardConfig {
  title: string;
  description: string;
  minWidth: number;
  columns: LeaderColumn[];
  sort: (a: MonthlyStaffPerformance, b: MonthlyStaffPerformance) => number;
}

const byRevenue = (a: MonthlyStaffPerformance, b: MonthlyStaffPerformance) =>
  b.revenueHandled - a.revenueHandled ||
  b.ordersCompleted - a.ordersCompleted ||
  a.name.localeCompare(b.name);

const byKitchenOutput = (
  a: MonthlyStaffPerformance,
  b: MonthlyStaffPerformance,
) =>
  b.ordersPrepared - a.ordersPrepared ||
  b.itemsPrepared - a.itemsPrepared ||
  a.name.localeCompare(b.name);

const LEADERBOARDS: Record<UserRole, LeaderboardConfig> = {
  ADMIN: {
    title: "Team leaderboard",
    description: "Everyone ranked by revenue settled this month",
    minWidth: 720,
    sort: byRevenue,
    columns: [
      {
        key: "name",
        label: "Member",
        render: (m) => (
          <span className="flex items-center gap-1.5">
            <span className="truncate font-semibold">{m.name}</span>
            <Badge tone={ROLE_TONE[m.role] ?? "zinc"}>
              {ROLE_LABEL[m.role] ?? m.role}
            </Badge>
          </span>
        ),
      },
      { key: "created", label: "Created", align: "right", render: (m) => m.ordersCreated },
      { key: "accepted", label: "Accepted", align: "right", render: (m) => m.ordersAccepted },
      { key: "prepared", label: "Prepared", align: "right", render: (m) => m.ordersPrepared },
      { key: "served", label: "Served", align: "right", render: (m) => m.ordersServed },
      { key: "completed", label: "Completed", align: "right", render: (m) => m.ordersCompleted },
      {
        key: "revenue",
        label: "Revenue",
        align: "right",
        render: (m) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatINR(m.revenueHandled)}
          </span>
        ),
      },
    ],
  },
  CAPTAIN: {
    title: "Captain leaderboard",
    description: "Floor captains ranked by revenue handled and orders served",
    minWidth: 620,
    sort: byRevenue,
    columns: [
      { key: "name", label: "Captain", render: (m) => <span className="font-semibold">{m.name}</span> },
      { key: "created", label: "Created", align: "right", render: (m) => m.ordersCreated },
      { key: "served", label: "Served", align: "right", render: (m) => m.ordersServed },
      { key: "completed", label: "Completed", align: "right", render: (m) => m.ordersCompleted },
      {
        key: "serve",
        label: "Avg serve",
        align: "right",
        render: (m) => formatDuration(m.avgServeSeconds),
      },
      {
        key: "revenue",
        label: "Revenue",
        align: "right",
        render: (m) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatINR(m.revenueHandled)}
          </span>
        ),
      },
    ],
  },
  CHEF: {
    title: "Kitchen leaderboard",
    description: "Chefs ranked by orders cooked and items prepared",
    minWidth: 600,
    sort: byKitchenOutput,
    columns: [
      { key: "name", label: "Chef", render: (m) => <span className="font-semibold">{m.name}</span> },
      { key: "accepted", label: "Accepted", align: "right", render: (m) => m.ordersAccepted },
      { key: "prepared", label: "Prepared", align: "right", render: (m) => m.ordersPrepared },
      { key: "items", label: "Items cooked", align: "right", render: (m) => m.itemsPrepared },
      {
        key: "prep",
        label: "Avg cook",
        align: "right",
        render: (m) => formatDuration(m.avgPrepSeconds),
      },
      { key: "cancelled", label: "Cancelled", align: "right", render: (m) => m.ordersCancelled },
    ],
  },
  CUSTOMER: {
    title: "Leaderboard",
    description: "",
    minWidth: 480,
    sort: byRevenue,
    columns: [
      { key: "name", label: "Name", render: (m) => <span className="font-semibold">{m.name}</span> },
    ],
  },
};

function StatGrid({
  role,
  me,
}: {
  role: UserRole;
  me: MonthlyStaffPerformance | null;
}) {
  const cards: Array<{
    label: string;
    value: string | number;
    hint?: string;
    icon: ReactNode;
    tone?: "default" | "green" | "red" | "amber";
  }> = (() => {
    if (role === "CAPTAIN") {
      return [
        { label: "Orders created", value: me?.ordersCreated ?? 0, icon: <ClipboardList size={14} /> },
        { label: "Orders served", value: me?.ordersServed ?? 0, icon: <Utensils size={14} /> },
        {
          label: "Completed",
          value: me?.ordersCompleted ?? 0,
          hint: `${me?.ordersCancelled ?? 0} cancelled`,
          icon: <Trophy size={14} />,
          tone: "green" as const,
        },
        {
          label: "Revenue handled",
          value: formatINR(me?.revenueHandled ?? 0),
          icon: <Wallet size={14} />,
        },
        {
          label: "Avg serve time",
          value: formatDuration(me?.avgServeSeconds ?? null),
          icon: <Clock size={14} />,
        },
      ];
    }
    if (role === "CHEF") {
      return [
        { label: "Accepted for cook", value: me?.ordersAccepted ?? 0, icon: <ChartNoAxesColumn size={14} /> },
        {
          label: "Orders prepared",
          value: me?.ordersPrepared ?? 0,
          icon: <Utensils size={14} />,
          tone: "green" as const,
        },
        { label: "Items cooked", value: me?.itemsPrepared ?? 0, icon: <ClipboardList size={14} /> },
        {
          label: "Avg cook time",
          value: formatDuration(me?.avgPrepSeconds ?? null),
          icon: <Clock size={14} />,
        },
        {
          label: "Cancelled",
          value: me?.ordersCancelled ?? 0,
          icon: <Trophy size={14} />,
        },
      ];
    }
    return [
      { label: "Orders created", value: me?.ordersCreated ?? 0, icon: <ClipboardList size={14} /> },
      { label: "Accepted", value: me?.ordersAccepted ?? 0, icon: <ChartNoAxesColumn size={14} /> },
      { label: "Prepared", value: me?.ordersPrepared ?? 0, icon: <Utensils size={14} /> },
      { label: "Served", value: me?.ordersServed ?? 0, icon: <Trophy size={14} /> },
      {
        label: "Completed",
        value: me?.ordersCompleted ?? 0,
        hint: `${me?.ordersCancelled ?? 0} cancelled`,
        tone: "green" as const,
        icon: <Trophy size={14} />,
      },
      {
        label: "Revenue handled",
        value: formatINR(me?.revenueHandled ?? 0),
        icon: <Wallet size={14} />,
      },
    ];
  })();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          hint={card.hint}
          icon={card.icon}
          tone={card.tone ?? "default"}
        />
      ))}
    </div>
  );
}

function Leaderboard({
  config,
  members,
  myId,
}: {
  config: LeaderboardConfig;
  members: MonthlyStaffPerformance[];
  myId: string;
}) {
  const ranked = useMemo(() => [...members].sort(config.sort), [members, config]);

  if (ranked.length === 0) {
    return (
      <EmptyState
        title="No activity this month"
        description="Performance appears here once orders move through the trail."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: config.minWidth }}
        >
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              <th className="w-10 px-3 py-2.5 text-left">#</th>
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ranked.map((member, index) => {
              const isMe = member.staffId === myId;
              return (
                <tr
                  key={member.staffId ?? `${member.role}:${member.name}`}
                  className={
                    isMe
                      ? "bg-accent-50/70 dark:bg-accent-500/10"
                      : "transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30"
                  }
                >
                  <td className="px-3 py-2.5 text-left">
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  {config.columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2.5 text-zinc-700 dark:text-zinc-200 ${
                        col.align === "right"
                          ? "text-right tabular-nums"
                          : "text-left"
                      }`}
                    >
                      {col.key === "name" ? (
                        <span className="flex items-center gap-1.5">
                          {col.render(member)}
                          {isMe && <Badge tone="indigo">You</Badge>}
                        </span>
                      ) : (
                        col.render(member)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Shared staff performance screen for every workspace (admin, captain, chef):
 * the signed-in member's own numbers for the selected month plus a
 * role-scoped leaderboard. Data comes from the immutable order trail.
 */
export function PerformanceScreen() {
  const { data: restaurant } = useMyRestaurant();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "ADMIN") as UserRole;
  const config = LEADERBOARDS[role];
  const queryClient = useQueryClient();
  const currentMonth = monthKey(new Date());

  const months = (() => {
    const fallback = new Date();
    const created = restaurant?.createdAt ? new Date(restaurant.createdAt) : null;
    const from =
      created && !Number.isNaN(created.getTime()) ? created : fallback;
    return monthsBetween(from, fallback);
  })();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const month =
    selectedMonth && months.includes(selectedMonth)
      ? selectedMonth
      : (months[months.length - 1] ?? currentMonth);

  const { data, isLoading, error, refetch, isFetching } =
    usePerformanceReport(month);

  const me = data?.me ?? null;
  const myId = me?.staffId ?? user?.id ?? "";
  const members = useMemo(() => {
    const staff = data?.staff ?? [];
    return role === "ADMIN"
      ? staff
      : staff.filter((member) => member.role === role);
  }, [data?.staff, role]);

  const ranked = useMemo(
    () => [...members].sort(config.sort),
    [members, config],
  );
  const myRank =
    ranked.findIndex((member) => member.staffId === myId) + 1 || null;

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: reportsKeys.performance(month),
    });
  };

  return (
    <SecondaryScreenAdapter
      title="Performance"
      subtitle={`${ROLE_LABEL[role] ?? "Staff"} · ${monthLabel(month)}`}
      action={
        <button
          type="button"
          onClick={refresh}
          title="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RotateCw size={16} className={isFetching ? "animate-spin" : ""} />
        </button>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Month rail */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
              <CalendarRange size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {monthLabel(month)}
              </p>
              <p className="truncate text-[11px] text-zinc-400">
                {data
                  ? `${data.range.days} ${
                      data.range.days === 1 ? "day" : "days"
                    } of activity`
                  : "Your performance for the month"}
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

        {error && !data ? (
          <EmptyState
            title="Performance unavailable"
            description="We couldn't load your performance right now."
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
        ) : isLoading && !data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[86px] animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800" />
          </div>
        ) : (
          <>
            {/* Own performance */}
            <section className="space-y-1.5">
              <p className="px-0.5 text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase">
                Your month
              </p>
              <StatGrid role={role} me={me} />
              {myRank && (
                <p className="px-0.5 text-[11px] text-zinc-400">
                  Ranked{" "}
                  <strong className="text-zinc-700 dark:text-zinc-200">
                    #{myRank}
                  </strong>{" "}
                  of {ranked.length}{" "}
                  {ranked.length === 1 ? "member" : "members"} ·{" "}
                  {me?.ordersCompleted ?? 0} orders completed
                </p>
              )}
            </section>

            {/* Team leaderboard */}
            <section className="space-y-2">
              <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
                <SectionTitle>{config.title}</SectionTitle>
                <span className="text-[10px] font-medium text-zinc-400">
                  {config.description}
                </span>
              </div>
              <Leaderboard config={config} members={members} myId={myId} />
            </section>
          </>
        )}
      </div>
    </SecondaryScreenAdapter>
  );
}
