import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Generates (and refreshes) a scannable attendance/overtime QR token.
 * `loader` returns the raw token; the hook renders it to a data URL.
 * `generate` is stable so it can safely be used in effect deps.
 */
export function useQrToken(loader: () => Promise<string | undefined>) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setToken(null);
    setUrl(null);
    try {
      const t = await loaderRef.current();
      if (!t) return;
      setToken(t);
      const dataUrl = await QRCode.toDataURL(t, {
        margin: 1,
        width: 320,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setUrl(dataUrl);
    } catch {
      /* error handled by the caller (toast) */
    } finally {
      setLoading(false);
    }
  }, []);

  return { token, url, loading, generate };
}
