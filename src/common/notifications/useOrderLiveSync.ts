import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeNotificationEvents } from "./notificationSocket";
import { orderKeys } from "../../hooks/use-orders";

/** Keeps staff order tabs in sync with live ORDER_UPDATED events broadcast over
 * the webhook rooms. On any order event it invalidates the shared
 * `["staff-orders"]` query so every role (admin/captain/chef) sees the
 * latest status without a manual refresh — matching the documented real-time
 * order flow. */
export function useOrderLiveSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const unsub = subscribeNotificationEvents((ev) => {
      if (ev.event === "ORDER_UPDATED" || ev.event === "ORDER_CREATED") {
        qc.invalidateQueries({ queryKey: orderKeys.staff });
        qc.invalidateQueries({ queryKey: orderKeys.guest });
      }
    });
    return unsub;
  }, [qc]);
}
