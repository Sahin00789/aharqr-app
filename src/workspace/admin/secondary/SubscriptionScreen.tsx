import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ExternalLink } from "lucide-react";
import { SecondaryScreen } from "../../../common/layouts/SecondaryScreen";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
} from "../../../common/ui";
import {
  getSubscriptionStatus,
  upgradeSubscription,
  type UpgradeInput,
} from "../../../api/subscriptionApi";
import toast from "react-hot-toast";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "zinc"> = {
  ACTIVE: "green",
  TRIAL: "amber",
  EXPIRED: "red",
  INACTIVE: "zinc",
  CANCELLED: "red",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Admin subscription & billing screen — reads live status, supports upgrade. */
export function SubscriptionScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: getSubscriptionStatus,
  });

  const upgradeMutation = useMutation({
    mutationFn: (input: UpgradeInput) => upgradeSubscription(input),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["subscription-status"] });
      if (res.paymentUrl) {
        window.open(res.paymentUrl, "_blank", "noopener");
      }
      toast.success("Subscription renewed");
    },
    onError: () => toast.error("Could not process upgrade"),
  });

  if (isLoading) {
    return (
      <SecondaryScreen title="Subscription">
        <p className="text-sm text-zinc-400">Loading subscription…</p>
      </SecondaryScreen>
    );
  }

  if (isError || !data) {
    return (
      <SecondaryScreen title="Subscription">
        <EmptyState
          title="Couldn't load subscription"
          description="Check your connection and try again."
        />
      </SecondaryScreen>
    );
  }

  return (
    <SecondaryScreen title="Subscription">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Plan" value={data.planName} />
          <StatCard
            label="Status"
            value={
              <Badge tone={STATUS_TONE[data.subscriptionStatus] ?? "zinc"}>
                {data.subscriptionStatus}
              </Badge>
            }
          />
          <StatCard label="Annual rate" value={`₹${data.annualRate}`} />
        </div>

        <SectionTitle>Current plan</SectionTitle>

        <Card className="space-y-3">
          {data.currentSubscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {data.currentSubscription.planName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {data.currentSubscription.status} · auto-renew{" "}
                    {data.currentSubscription.autoRenew ? "on" : "off"}
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-700">
                  ₹{data.currentSubscription.amount}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-400">Starts</p>
                  <p className="text-zinc-700">
                    {formatDate(data.currentSubscription.startsAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Renews / expires</p>
                  <p className="text-zinc-700">
                    {formatDate(data.currentSubscription.expiresAt)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              No active subscription record yet.
            </p>
          )}

          <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">
              Account validity:{" "}
              <span className="font-medium text-zinc-600">
                {data.isValid ? "Active" : "Expired"}
              </span>{" "}
              · Expires {formatDate(data.subscriptionExpiresAt)}
            </p>
          </div>
        </Card>

        <SectionTitle>Manage</SectionTitle>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
              <CreditCard size={20} />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Renew / upgrade
              </p>
              <p className="text-xs text-zinc-400">
                Extend for 12 months (₹{data.annualRate}).
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => upgradeMutation.mutate({ durationMonths: 12 })}
            loading={upgradeMutation.isPending}
          >
            Renew 1 year <ExternalLink size={14} />
          </Button>
        </Card>
      </div>
    </SecondaryScreen>
  );
}

