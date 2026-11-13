import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getGuestOrders, type GuestOrder } from "../../services/menu.service";
import { useNotificationStore } from "../../common/notifications/notificationStore";
import { prettifyStatus } from "../../common/notifications/notificationSocket";
import { useGuestSessionStore } from "./guest-session-store";

/**
 * Polls the guest (table) order feed every 5s and notifies when an order
 * transitions state — in-app (toast) + the current dining session's private
 * notification history. The initial fetch is treated as a baseline so returning
 * guests aren't spammed by their pre-existing orders.
 */
export function useGuestOrderNotifications() {
  const prevRef = useRef<Map<string, string>>(new Map());
  const initializedRef = useRef(false);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const session = useGuestSessionStore((s) => s.session);
  const restaurant = session?.restaurantSlug ?? "";

  useQuery({
    queryKey: ["guest-orders-notifications", restaurant],
    queryFn: async () => {
      const res = await getGuestOrders();
      const initialized = initializedRef.current;
      if (initialized) {
        pushStatusUpdates(res.orders, prevRef.current, addNotification);
      }
      prevRef.current = new Map(res.orders.map((o) => [o.id, o.status]));
      initializedRef.current = true;
      return res;
    },
    enabled: Boolean(session),
    refetchInterval: 5000,
  });
}

function pushStatusUpdates(
  orders: GuestOrder[],
  prev: Map<string, string>,
  addNotification: (n: {
    title: string;
    body?: string;
    type: "order";
  }) => void
) {
  for (const o of orders) {
    const prevStatus = prev.get(o.id);
    const label = `Order #${o.orderNumber}`;

    if (prevStatus === undefined) {
      addNotification({
        type: "order",
        title: `${label} placed`,
        body: "Your order is being reviewed by the restaurant.",
      });
      toast(`${label} placed`, { icon: "🧾" });
      continue;
    }

    if (prevStatus !== o.status) {
      const statusLabel = prettifyStatus(o.status);
      addNotification({
        type: "order",
        title: `${label} · ${statusLabel}`,
        body: `Your order is now ${statusLabel.toLowerCase()}.`,
      });
      toast(`${label} — ${statusLabel}`, { icon: "🔔" });
    }
  }
}