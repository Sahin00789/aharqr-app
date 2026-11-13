import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronDown, Laptop, LogOut, Monitor, Smartphone } from "lucide-react";
import { Card } from "../../components";
import {
  listSessions,
  revokeSession,
  type SessionDevice,
} from "../../../services/sessions.service";
import { SecondaryScreenAdapter } from "../../layouts/SecondaryScreenAdapter";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function describeUA(ua?: string | null): { type: "desktop" | "mobile"; label: string } {
  if (!ua) return { type: "desktop", label: "Unknown device" };
  const mobile = /mobile|android|iphone|ipad/i.test(ua);
  const browser = /edg/i.test(ua)
    ? "Edge"
    : /chrome/i.test(ua)
      ? "Chrome"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /mac os/i.test(ua)
      ? "macOS"
      : /android/i.test(ua)
        ? "Android"
        : /iphone|ipad|ios/i.test(ua)
          ? "iOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown OS";
  return { type: mobile ? "mobile" : "desktop", label: `${browser} on ${os}` };
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

function formatFull(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Small labelled meta stat used in the device summary grid. */
function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function DeviceIcon({ type }: { type: "desktop" | "mobile" }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
      {type === "mobile" ? <Smartphone size={19} /> : <Laptop size={19} />}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Device grouping                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Stable key to group sessions that belong to the same physical device.
 * Priority: the browser-generated `deviceId` (UUID in localStorage, sent as
 * `x-device-id` header on every request). Fallback: a hash of
 * `userAgent + ip` so untracked sessions still deduplicate sensibly.
 */
function deviceKey(s: SessionDevice): string {
  if (s.deviceId) return `dev:${s.deviceId}`;
  const raw = `${s.userAgent ?? ""}||${s.ip ?? ""}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `hash:${hash}`;
}

interface DeviceGroup {
  /** The most-recently-active session for this device. */
  latest: SessionDevice;
  /** The oldest session for this device (first signed-in). */
  earliest: SessionDevice;
  /** All sessions belonging to this device (sorted newest-first). */
  sessions: SessionDevice[];
  /** True if any session in the group is the current browser session. */
  hasCurrent: boolean;
}

function groupByDevice(sessions: SessionDevice[]): DeviceGroup[] {
  const map = new Map<string, SessionDevice[]>();
  for (const s of sessions) {
    const key = deviceKey(s);
    const arr = map.get(key);
    if (arr) arr.push(s);
    else map.set(key, [s]);
  }

  return Array.from(map.values())
    .map((group) => {
      group.sort(
        (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
      );
      return {
        latest: group[0],
        earliest: group[group.length - 1],
        sessions: group,
        hasCurrent: group.some((s) => s.current),
      };
    })
    .sort((a, b) => {
      if (a.hasCurrent && !b.hasCurrent) return -1;
      if (!a.hasCurrent && b.hasCurrent) return 1;
      return (
        new Date(b.latest.lastSeenAt).getTime() -
        new Date(a.latest.lastSeenAt).getTime()
      );
    });
}

/* -------------------------------------------------------------------------- */
/*  Screen                                                                    */
/* -------------------------------------------------------------------------- */

/** Shared across all staff roles (admin, captain, chef). */
export function LoggedDevicesScreen() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const { data, isPending } = useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
  });

  const allSessions = useMemo(() => data ?? [], [data]);
  const groups = useMemo(() => groupByDevice(allSessions), [allSessions]);
  const otherSessions = allSessions.filter((s) => !s.current);

  const revoke = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => revokeSession(id))),
    onSuccess: () => {
      toast.success("Signed out");
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const deviceCount = groups.length;

  return (
    <SecondaryScreenAdapter title="Active Sessions">
      <Card className="overflow-hidden p-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold">Active Sessions</p>
            <p className="text-xs text-zinc-500">
              {deviceCount} device{deviceCount === 1 ? "" : "s"} signed in
              {allSessions.length !== deviceCount && (
                <> · {allSessions.length} total sessions</>
              )}
            </p>
          </div>
          {otherSessions.length > 0 && (
            <button
              onClick={() => revoke.mutate(otherSessions.map((s) => s.id))}
              disabled={revoke.isPending}
              className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign out all others
            </button>
          )}
        </div>

        {/* Device groups */}
        {isPending ? (
          <div className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        ) : groups.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-400">
            No active sessions
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {groups.map((group) => {
              const key = deviceKey(group.latest);
              const d = describeUA(group.latest.userAgent);
              const multiple = group.sessions.length > 1;
              const isOpen = expanded.has(key);
              return (
                <div key={key} className="px-4 py-3.5">
                  {/* Row */}
                  <div className="flex items-center gap-3">
                    <DeviceIcon type={d.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{d.label}</p>
                        {group.hasCurrent && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            This device
                          </span>
                        )}
                        {multiple && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {group.sessions.length} sessions
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {group.latest.ip ?? "Unknown IP"} · Active{" "}
                        {timeAgo(group.latest.lastSeenAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {multiple && (
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? "Hide sessions" : "Show sessions"}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                      {!group.hasCurrent && (
                        <button
                          onClick={() =>
                            revoke.mutate(group.sessions.map((s) => s.id))
                          }
                          disabled={revoke.isPending}
                          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meta grid */}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-zinc-100 pt-3 sm:grid-cols-4 dark:border-zinc-800/60">
                    <Meta label="IP address" value={group.latest.ip ?? "Unknown"} />
                    <Meta
                      label="Signed in"
                      value={
                        <span title={formatFull(group.earliest.createdAt)}>
                          {timeAgo(group.earliest.createdAt)}
                        </span>
                      }
                    />
                    <Meta
                      label="Last active"
                      value={
                        <span title={formatFull(group.latest.lastSeenAt)}>
                          {timeAgo(group.latest.lastSeenAt)}
                        </span>
                      }
                    />
                    <Meta
                      label="Session expires"
                      value={
                        <span
                          title={
                            group.latest.expiresAt
                              ? formatFull(group.latest.expiresAt)
                              : "Until logout"
                          }
                        >
                          {group.latest.expiresAt
                            ? timeAgo(group.latest.expiresAt)
                            : "Never"}
                        </span>
                      }
                    />
                  </div>

                  {/* Expanded session list */}
                  {multiple && isOpen && (
                    <ul className="mt-2 overflow-hidden rounded-lg border border-zinc-200/70 dark:border-zinc-800">
                      {group.sessions.map((s) => (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-100 px-3.5 py-2.5 text-xs last:border-0 dark:border-zinc-800/60"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Monitor size={13} className="text-zinc-400" />
                            {s.current ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Current session
                              </span>
                            ) : (
                              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                                {describeUA(s.userAgent).label}
                              </span>
                            )}
                          </span>
                          <span className="text-zinc-500">
                            Signed in {formatFull(s.createdAt)}
                          </span>
                          <span className="text-zinc-500">
                            Active {timeAgo(s.lastSeenAt)}
                          </span>
                          <span className="hidden text-zinc-400 sm:inline">
                            {s.ip ?? "Unknown IP"}
                          </span>
                          <span className="ml-auto">
                            {s.current ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={() => revoke.mutate([s.id])}
                                disabled={revoke.isPending}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                              >
                                <LogOut size={12} />
                                Sign out
                              </button>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-zinc-400">
        Sessions are grouped per device. Multiple tabs from the same browser
        share one device entry.
      </p>
    </SecondaryScreenAdapter>
  );
}