import { Link } from "react-router";
import { QrCode } from "lucide-react";
import { useAuthStore } from "../stores/auth-store";
import { NavigateToMyWorkspace } from "./guards";

/** Public landing page. Sends an already-signed-in user to their workspace. */
export function Home() {
  const user = useAuthStore((s) => s.user);
  const booted = useAuthStore((s) => s.booted);

  if (booted && user) return <NavigateToMyWorkspace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent2-600 text-white shadow-lg">
          <QrCode size={26} />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">AharQR</h1>
          <p className="mx-auto max-w-sm text-sm text-zinc-400">
            Restaurant OS — QR ordering, floor management and a live kitchen display in one place.
          </p>
        </div>
        <div className="mt-2 flex gap-3">
          <Link
            to="/auth"
            className="rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
