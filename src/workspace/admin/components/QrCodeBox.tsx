import { Copy, Check, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

/** Renders a scannable QR image with an optional refresh action. */
export function QrCodeBox({
  url,
  token,
  loading,
  error,
  onRefresh,
  refreshLabel = "Refresh QR",
  secondsLeft,
}: {
  url: string | null;
  /** Raw QR payload — shown only in dev for quick testing (scan simulation). */
  token?: string | null;
  loading: boolean;
  /** Optional failure message shown when no QR could be generated. */
  error?: string | null;
  onRefresh?: () => void;
  refreshLabel?: string;
  /** Seconds until the QR auto-refreshes (optional countdown display). */
  secondsLeft?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToken() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
      {loading ? (
        <div className="flex h-48 w-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
      ) : url ? (
        <img
          src={url}
          alt="Attendance QR"
          className="h-48 w-48 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700"
        />
      ) : (
        <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 px-4 text-center">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            QR unavailable
          </p>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {error || "This QR can no longer be generated. Refresh to try again."}
          </p>
        </div>
      )}

      {url && import.meta.env.DEV && token && (
        <div className="w-full max-w-xs rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              Dev · Raw token
            </span>
            <button
              type="button"
              onClick={copyToken}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-accent-600 transition hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-500/10"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {token}
          </p>
        </div>
      )}

      {onRefresh && (
        <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
          {url && typeof secondsLeft === "number" && (
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Auto-refreshes in{" "}
              <span className="font-bold text-accent-600 dark:text-accent-400 tabular-nums">
                {secondsLeft}s
              </span>
            </p>
          )}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-600 transition hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-500/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {refreshLabel}
          </button>
        </div>
      )}
    </div>
  );
}
