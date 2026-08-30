import { useNotificationStore } from "./notificationStore";
import type { NotificationType } from "./notificationStore";

interface RawEvent {
  event?: string;
  orderId?: string | number;
  orderType?: string;
  status?: string;
  [key: string]: unknown;
}

/** Rooms the backend broadcasts to per restaurant. */
const ROOM_SUFFIXES = ["orders", "kitchen", "captain"] as const;

function wsOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    return apiUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");
  }
  return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
}

function prettifyStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type EventListener = (ev: RawEvent) => void;
const eventListeners = new Set<EventListener>();

/** Subscribe to raw events (e.g. ORDER_UPDATED) for live UI sync. Returns a
 * disposer. Fires for every restaurant room the socket is connected to. */
export function subscribeNotificationEvents(cb: EventListener): () => void {
  eventListeners.add(cb);
  return () => {
    eventListeners.delete(cb);
  };
}

function toNotification(ev: RawEvent): {
  type: NotificationType;
  title: string;
  body: string;
} | null {
  switch (ev.event) {
    case "ROOM_CONNECTED":
    case "PONG":
      return null;
    case "ORDER_UPDATED": {
      const orderType = (ev.orderType ?? "DINE_IN").toString();
      const status = (ev.status ?? "").toString();
      const orderId = (ev.orderId ?? "").toString();
      const label = orderType === "TAKEAWAY" ? "Takeaway" : "Dine-in";
      return {
        type: "order",
        title: `Order ${prettifyStatus(status)}`,
        body: `${label} order #${orderId} is now ${status}.`,
      };
    }
    default:
      return {
        type: "system",
        title: ev.event ? String(ev.event) : "Update",
        body: "New event received from the kitchen.",
      };
  }
}

/**
 * Opens a WebSocket per restaurant room and pushes incoming events into the
 * notification store. Auto-reconnects with a small backoff. Returns a disposer.
 */
export function connectNotificationSocket(restaurantId: string): () => void {
  if (!restaurantId) return () => {};
  const origin = wsOrigin();
  const addNotification = useNotificationStore.getState().addNotification;

  let disposed = false;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const sockets = new Map<string, WebSocket>();

  const scheduleReconnect = (suffix: string) => {
    if (disposed || timers.has(suffix)) return;
    const t = setTimeout(() => {
      timers.delete(suffix);
      open(suffix);
    }, 3000);
    timers.set(suffix, t);
  };

  const open = (suffix: string) => {
    if (disposed) return;
    const roomId = `restaurant:${restaurantId}:${suffix}`;
    const url = `${origin}/ws/webhook-room/${roomId}`;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleReconnect(suffix);
      return;
    }
    sockets.set(suffix, ws);

    ws.onmessage = (msg) => {
      try {
        const ev = JSON.parse(msg.data as string) as RawEvent;
        eventListeners.forEach((l) => l(ev));
        const n = toNotification(ev);
        if (n) addNotification(n);
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {
        /* noop */
      }
    };
    ws.onclose = () => {
      sockets.delete(suffix);
      if (!disposed) scheduleReconnect(suffix);
    };
  };

  ROOM_SUFFIXES.forEach(open);

  return () => {
    disposed = true;
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    sockets.forEach((s) => {
      try {
        s.close();
      } catch {
        /* noop */
      }
    });
    sockets.clear();
  };
}
