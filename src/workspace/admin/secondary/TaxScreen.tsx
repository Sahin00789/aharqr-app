import { useState } from "react";
import toast from "react-hot-toast";
import { BadgePercent, Percent } from "lucide-react";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import { Button, Card, Input, SectionTitle } from "../../../common/components";
import { Toggle } from "../../../common/components/fields";
import { useMyRestaurant, useUpdateMyRestaurant } from "../../../hooks/use-restaurant";
import type { RestaurantProfile } from "../../../services/restaurant.services";

function rateOf(r: RestaurantProfile): number {
  if (r.gstRate === undefined || r.gstRate === null) return 5;
  return typeof r.gstRate === "string" ? Number(r.gstRate) : r.gstRate;
}

function TaxForm({ restaurant }: { restaurant: RestaurantProfile }) {
  const updateRestaurant = useUpdateMyRestaurant();
  const [gstRate, setGstRate] = useState<string>(String(rateOf(restaurant)));
  const [taxMode, setTaxMode] = useState<"INCLUSIVE" | "EXCLUSIVE">(
    restaurant.taxMode ?? "INCLUSIVE",
  );
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(
    Boolean(restaurant.showTaxBreakdown),
  );

  async function save() {
    const rate = Number(gstRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 40) {
      toast.error("GST rate must be between 0 and 40%");
      return;
    }
    try {
      await updateRestaurant.mutateAsync({
        gstRate: rate,
        taxMode,
        showTaxBreakdown,
      });
      toast.success("Tax settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save tax settings");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-50 p-4 text-sm text-zinc-600 dark:bg-accent-950/20 dark:text-zinc-300">
        <BadgePercent size={18} className="mt-0.5 shrink-0 text-accent-600" />
        <p>
          GST is applied to guest orders. Prices on the menu are treated as{" "}
          <strong>inclusive of GST</strong> by default — the amount a guest pays is the
          price they see. Switch to <strong>exclusive</strong> to add GST on top at
          checkout.
        </p>
      </div>

      <Card>
        <SectionTitle>Tax rate</SectionTitle>
        <Input
          id="gstRate"
          label="GST rate (%)"
          type="number"
          min={0}
          max={40}
          step="0.5"
          value={gstRate}
          onChange={(e) => setGstRate(e.target.value)}
          placeholder="e.g. 5, 12 or 18"
        />
      </Card>

      <Card>
        <SectionTitle>Billing mode</SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(["INCLUSIVE", "EXCLUSIVE"] as const).map((mode) => {
            const active = taxMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setTaxMode(mode)}
                aria-pressed={active}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-accent-500 bg-accent-50 ring-2 ring-accent-500/20 dark:bg-accent-950/30"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                }`}
              >
                <p className="text-sm font-semibold">
                  {mode === "INCLUSIVE" ? "Inclusive of GST" : "GST on top"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {mode === "INCLUSIVE"
                    ? "Menu price already includes GST. Total = price."
                    : `GST (${gstRate || 0}%) added at checkout. Total = price + tax.`}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>Guest receipt</SectionTitle>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Show GST breakdown to guests</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Displays a "GST ({gstRate || 0}%)" line with the tax amount on the cart and
              order screens.
            </p>
          </div>
          <Toggle
            checked={showTaxBreakdown}
            onChange={setShowTaxBreakdown}
            label="Show GST breakdown to guests"
          />
        </div>
      </Card>

      <Button
        onClick={save}
        loading={updateRestaurant.isPending}
        loadingText="Saving…"
        className="w-full sm:w-auto"
      >
        <Percent size={16} />
        Save tax settings
      </Button>
    </div>
  );
}

/** Admin GST / billing screen — rate, inclusive vs exclusive, guest breakdown. */
export function TaxScreen() {
  const { data: restaurant, isLoading } = useMyRestaurant();

  return (
    <SecondaryScreenAdapter title="Tax & GST">
      {isLoading || !restaurant ? (
        <p className="text-sm text-zinc-400">Loading current settings…</p>
      ) : (
        <TaxForm key={restaurant.id} restaurant={restaurant} />
      )}
    </SecondaryScreenAdapter>
  );
}