import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router";
import { QrCode } from "lucide-react";
import { api, ApiError } from "../../../services/api-client";
import { AppLogo, PageLoader } from "../../../common/components";
import {
  useGuestSessionStore,
  type GuestSession,
} from "../guest-session-store";
import {
  clearGuestSessionCookie,
  getGuestSessionCookie,
  setGuestSessionCookie,
} from "../../../utils/guest-session.util";

async function establishSessionFromToken(
  token: string,
): Promise<GuestSession> {
  const res = await api<{ success: boolean; session: GuestSession }>(
    "/api/table/scan",
    { method: "POST", auth: false, body: { token } },
  );
  setGuestSessionCookie(res.session.token);
  return res.session;
}

async function validateExistingSession(): Promise<GuestSession | null> {
  const cookieToken = getGuestSessionCookie();
  if (!cookieToken) return null;
  try {
    const res = await api<{ success: boolean; session: GuestSession }>(
      "/api/customer/session",
      { method: "POST", auth: false, body: { sessionToken: cookieToken } },
    );
    setGuestSessionCookie(res.session.token);
    return res.session;
  } catch {
    return null;
  }
}

type GatePhase = "loading" | "ready" | "scan-required";

export function GuestSessionGate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useGuestSessionStore((s) => s.session);
  const setSession = useGuestSessionStore((s) => s.setSession);
  const clearSession = useGuestSessionStore((s) => s.clearSession);

  const [phase, setPhase] = useState<GatePhase>(session ? "ready" : "loading");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [tableOccupied, setTableOccupied] = useState(false);
  const attemptRef = useRef<Promise<GuestSession> | null>(null);
  const hasAttemptedRef = useRef(false);
  const scanToken = searchParams.get("token");

  useEffect(() => {
    const cookieToken = getGuestSessionCookie();

    if (session && !scanToken) return;

    let cancelled = false;
    if (!attemptRef.current && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      if (scanToken) {
        attemptRef.current = establishSessionFromToken(scanToken);
      } else if (cookieToken) {
        attemptRef.current = validateExistingSession().then((s) => {
          if (s) return s;
          throw new Error("No valid session");
        });
      } else {
        attemptRef.current = Promise.reject(new Error("No session"));
      }
    }

    attemptRef.current
      ?.then((established) => {
        if (cancelled) return;
        setSession(established);
        setPhase("ready");
        if (scanToken) {
          attemptRef.current = null;
          navigate("/customer", { replace: true });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        clearSession();
        clearGuestSessionCookie();
        setTableOccupied(error instanceof ApiError && error.status === 409);
        setScanMessage(
          error instanceof Error ? error.message : "Please scan the QR code on your table.",
        );
        setPhase("scan-required");
      });

    return () => {
      cancelled = true;
    };
  }, [scanToken, session, navigate, setSession, clearSession]);

  if (phase === "scan-required") {
    return (
      <ScanRequiredView
        occupied={tableOccupied}
        message={scanMessage}
      />
    );
  }
  if (phase === "loading" && !session) {
    return <PageLoader label="Opening your table…" />;
  }
  return <Outlet />;
}

function ScanRequiredView({
  occupied,
  message,
}: {
  occupied: boolean;
  message: string | null;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex justify-center">
          <AppLogo className="h-9 dark:rounded-xl dark:bg-white/95 dark:px-2 dark:py-1" />
        </div>
        <h1 className="mt-5 text-lg font-bold tracking-tight">
          {occupied ? "This table is occupied" : "Scan to start ordering"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {message ??
            "This page needs a valid dining session. Please scan the QR code on your table to open the menu."}
          {occupied && (
            <span className="mt-2 block">
              Please wait until the current order is completed, or ask a staff member for help.
            </span>
          )}
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          <QrCode size={16} /> Go to AharQR
        </Link>
      </div>
    </div>
  );
}
