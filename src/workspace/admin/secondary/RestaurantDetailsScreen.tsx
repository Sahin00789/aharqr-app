import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button, Card, Input } from "../../../common/ui";
import {
  getMyRestaurant,
  updateMyRestaurant,
  type RestaurantProfile,
} from "../../../services/restaurant.services";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";

export function RestaurantDetailsScreen() {
  const navigate = useNavigate();
  const query = useQuery<RestaurantProfile>({
    queryKey: ["my-restaurant"],
    queryFn: getMyRestaurant,
    retry: false,
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.data) {
      setName(query.data.name);
      setPhone(query.data.phone ?? "");
      setAddress(query.data.address ?? "");
    }
  }, [query.data]);

  async function save() {
    setSaving(true);
    try {
      await updateMyRestaurant({ name, phone, address });
      toast.success("Restaurant saved");
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (query.isPending) {
    return (
      <SecondaryScreenAdapter title="Restaurant details">
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </SecondaryScreenAdapter>
    );
  }

  return (
    <SecondaryScreenAdapter title="Restaurant details">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Restaurant details
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            This information is shown to customers and on printed receipts.
          </p>
        </div>

        <Card className="space-y-4">
          <Input
            id="rname"
            label="Restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="rphone"
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            id="raddress"
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} loadingText="Saving…" onClick={save}>
            Save restaurant
          </Button>
        </div>
      </div>
    </SecondaryScreenAdapter>
  );
}

