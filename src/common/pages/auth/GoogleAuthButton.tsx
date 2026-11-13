import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface GsiCodeClient {
  requestCode: () => void;
}

interface GsiInitArgs {
  client_id: string;
  scope: string;
  ux_mode: "popup" | "redirect";
  redirect_uri?: string;
  callback: (response: {
    code?: string;
    error?: string;
    error_description?: string;
  }) => void;
}

interface GsiOAuth2 {
  initCodeClient: (args: GsiInitArgs) => GsiCodeClient;
}

/** Minimal shape of `window.google.accounts.oauth2` (GIS SDK). */
function getOAuth2(): GsiOAuth2 | null {
  const accounts = (window as unknown as {
    google?: { accounts?: { oauth2?: GsiOAuth2 } };
  }).google?.accounts;
  return accounts?.oauth2 ?? null;
}

interface GoogleAuthButtonProps {
  /** Receives the Google OAuth authorization code; resolves when the
   * code exchange issued by `onCode` completes. */
  onCode: (code: string) => Promise<void>;
  onError?: (message: string) => void;
  label?: string;
  /** Shown while the authorization code is being exchanged by `onCode`. */
  loadingLabel?: string;
  className?: string;
}

/**
 * Custom Tailwind "Continue with Google" button backed by the Google
 * Identity Services (GIS) auth-code flow. The backend swaps the returned
 * `code` for tokens server-side (`redirect_uri: "postmessage"`), so this
 * button issues a popup code request instead of exposing a raw JWT.
 */
export function GoogleAuthButton({
  onCode,
  onError,
  label = "Continue with Google",
  loadingLabel = "Signing you in…",
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<GsiCodeClient | null>(null);

  const getClient = (): GsiCodeClient => {
    if (clientRef.current) return clientRef.current;

    const oauth2 = getOAuth2();
    if (!oauth2) {
      throw new Error(
        "Google Identity Services failed to load. Refresh the page and try again.",
      );
    }

    clientRef.current = oauth2.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "email profile openid",
      ux_mode: "popup",
      callback: (response) => {
        if (response.code) {
          setLoading(true);
          onCode(response.code)
            .catch((err) =>
              onError?.(
                err instanceof Error ? err.message : "Google sign-in failed",
              ),
            )
            .finally(() => setLoading(false));
        } else if (response.error) {
          onError?.(
            `Google sign-in failed: ${response.error_description || response.error}`,
          );
        } else {
          onError?.("Google sign-in was cancelled or failed");
        }
      },
    });

    return clientRef.current;
  };

  const trigger = () => {
    try {
      getClient().requestCode();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={loading}
      aria-busy={loading}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 ${className}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-accent-600" aria-hidden />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      )}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
}