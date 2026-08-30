import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Laptop, LogOut, Smartphone } from "lucide-react";
import { Card } from "../../../common/ui";
import {
  listSessions,
  revokeSession,
  type SessionDevice,
} from "../../../services/sessions.service";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";

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

export function LoggedDevicesScreen() {
  const qc = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => {
      toast.success("Device signed out");
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const devices = data ?? [];
  const others = devices.filter((s: SessionDevice) => !s.current);

  return (
    <SecondaryScreenAdapter title="Logged devices">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold">Active sessions</p>
            <p className="text-xs text-zinc-500">
              {devices.length} device{devices.length === 1 ? "" : "s"} signed in
            </p>
          </div>
          {others.length > 0 && (
            <button
              onClick={() => others.forEach((s) => revoke.mutate(s.id))}
              className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign out all others
            </button>
          )}
        </div>

        {isPending ? (
          <div className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <ul>
            {devices.map((s) => {
              const d = describeUA(s.userAgent);
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-800/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                    {d.type === "mobile" ? <Smartphone size={18} /> : <Laptop size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{d.label}</p>
                      {s.current && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      {s.ip ?? "Unknown IP"} · Active {timeAgo(s.lastSeenAt)}
                    </p>
                  </div>
                  {!s.current && (
                    <button
                      onClick={() => revoke.mutate(s.id)}
                      disabled={revoke.isPending}
                      className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </SecondaryScreenAdapter>
  );
}

