import { Loader2, RefreshCw } from "lucide-react";

/** Renders a scannable QR image with an optional refresh action. */
export function QrCodeBox({
  url,
  loading,
  onRefresh,
  refreshLabel = "Refresh QR",
}: {
  url: string | null;
  loading: boolean;
  onRefresh?: () => void;
  refreshLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
      {loading || !url ? (
        <div className="flex h-48 w-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
      ) : (
        <img
          src={url}
          alt="Attendance QR"
          className="h-48 w-48 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700"
        />
      )}
      {onRefresh && url && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-600 transition hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-500/10"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {refreshLabel}
        </button>
      )}
    </div>
  );
}
