import { Link } from "react-router";
import { SecondaryScreenAdapter } from "../../layouts/SecondaryScreenAdapter";
import {
  Mail,
  LifeBuoy,
  ClipboardList,
  UtensilsCrossed,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Card } from "../../components";

export function SecurityScreen() {
  return (
    <SecondaryScreenAdapter title="Security">
      <Card>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-accent-600" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Email sign-in
            </p>
            <p className="text-xs text-zinc-400">
              You sign in with a one-time code sent to your email — there is no
              password to manage. Contact your restaurant admin if your email
              changes.
            </p>
          </div>
        </div>
      </Card>
    </SecondaryScreenAdapter>
  );
}

export function HelpScreen() {
  return (
    <SecondaryScreenAdapter title="Help">
      <Card>
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-5 w-5 text-accent-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Support</p>
            <p className="text-xs text-zinc-400">
              Reach us at support@aharqr.test or contact your restaurant admin.
            </p>
          </div>
          <Link
            to="/help"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-accent-600 transition hover:bg-accent-50 dark:border-zinc-700 dark:text-accent-400 dark:hover:bg-accent-500/15"
          >
            Full help center <ExternalLink size={13} />
          </Link>
        </div>
      </Card>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature icon={<ClipboardList className="h-4 w-4" />} title="Orders" text="Track live orders and their status." />
        <Feature icon={<UtensilsCrossed className="h-4 w-4" />} title="Menu" text="Browse dishes and their availability." />
        <Feature icon={<Wallet className="h-4 w-4" />} title="Payments" text="Process customer payments on the floor." />
      </div>
    </SecondaryScreenAdapter>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-2 text-accent-600">
        {icon}
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{title}</span>
      </div>
      <p className="mt-1 text-xs text-zinc-400">{text}</p>
    </div>
  );
}
