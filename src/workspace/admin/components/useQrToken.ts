import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Generates (and refreshes) a scannable attendance/overtime QR token.
 * `loader` returns the raw token or throws on failure. The hook renders the
 * token to a data URL and exposes the failure message via `error`.
 * `generate` is stable so it can safely be used in effect deps.
 *
 * When `enabled` is true and a QR is currently displayed, the token is
 * automatically regenerated every `refreshIntervalMs` (default 60s) so the
 * short-lived QR stays valid, and `secondsLeft` exposes a countdown for the UI.
 */
export function useQrToken(
  loader: () => Promise<string | undefined>,
  opts: { enabled?: boolean; refreshIntervalMs?: number } = {},
) {
  const { enabled = true, refreshIntervalMs = 60_000 } = opts;
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(
    refreshIntervalMs / 1000,
  );

  const generate = useCallback(async () => {
    setLoading(true);
    setToken(null);
    setUrl(null);
    setError(null);
    setSecondsLeft(refreshIntervalMs / 1000);
    try {
      const t = await loaderRef.current();
      if (!t) {
        setError("Could not generate QR. No token was returned.");
        return;
      }
      setToken(t);
      const dataUrl = await QRCode.toDataURL(t, {
        margin: 1,
        width: 320,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not generate QR. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [refreshIntervalMs]);

  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Regenerate the token once it expires while the QR is on screen.
  useEffect(() => {
    if (!enabled || !url) return;
    const id = setTimeout(() => void generate(), refreshIntervalMs);
    return () => clearTimeout(id);
  }, [enabled, url, generate, refreshIntervalMs]);

  // Drive the visible countdown (pauses while loading / disabled).
  useEffect(() => {
    if (!enabled || !url) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, url]);

  return { token, url, loading, error, generate, secondsLeft };
}
