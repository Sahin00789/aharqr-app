import { useNotificationStore } from "./notificationStore";
import type { NotificationType } from "./notificationStore";

interface RawEvent {
  event?: string;
  orderId?: string | number;
  orderType?: string;
  status?: string;
  severity?: "success" | "error";
  title?: string;
  body?: string;
  [key: string]: unknown;
}

function wsOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    return apiUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");
  }
  return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
}

export function prettifyStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type EventListener = (ev: RawEvent) => void;
const eventListeners = new Set<EventListener>();

export function subscribeNotificationEvents(cb: EventListener): () => void {
  eventListeners.add(cb);
  return () => {
    eventListeners.delete(cb);
  };
}

export type NotificationConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected";

const openRooms = new Set<string>();
const connectionListeners = new Set<
  (status: NotificationConnectionStatus) => void
>();
let connectionStatus: NotificationConnectionStatus = "disconnected";

function emitConnectionStatus(next: NotificationConnectionStatus) {
  if (next === connectionStatus) return;
  connectionStatus = next;
  connectionListeners.forEach((listener) => listener(next));
}

export function getOpenRoomCount(): number {
  return openRooms.size;
}

export function getNotificationConnectionStatus(): NotificationConnectionStatus {
  return connectionStatus;
}

export function subscribeNotificationConnection(
  cb: (status: NotificationConnectionStatus) => void,
): () => void {
  connectionListeners.add(cb);
  return () => {
    connectionListeners.delete(cb);
  };
}

function toNotification(ev: RawEvent): {
  type: NotificationType;
  title: string;
  body: string;
} | null {
  if (ev.event !== "USER_ACTIVITY" || !ev.title) return null;
  return {
    type: "order",
    title: ev.title,
    body: ev.body ?? "",
  };
}

/**
 * Keeps restaurant-wide order events for live screen sync, while user activity
 * alerts arrive only through the authenticated role-and-user notification room.
 */
export function connectNotificationSocket(
  restaurantId: string,
  accessToken: string,
): () => void {
  if (!restaurantId || !accessToken) return () => {};
  const origin = wsOrigin();
  const addNotification = useNotificationStore.getState().addNotification;

  let disposed = false;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const sockets = new Map<string, WebSocket>();
  const rooms = ["orders", "notifications"] as const;

  emitConnectionStatus("connecting");

  const scheduleReconnect = (room: (typeof rooms)[number]) => {
    if (disposed || timers.has(room)) return;
    const timer = setTimeout(() => {
      timers.delete(room);
      open(room);
    }, 3000);
    timers.set(room, timer);
  };

  const open = (room: (typeof rooms)[number]) => {
    if (disposed) return;
    const url = room === "notifications"
      ? `${origin}/ws/notifications`
      : `${origin}/ws/webhook-room/restaurant:${restaurantId}:orders`;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleReconnect(room);
      return;
    }
    sockets.set(room, ws);

    ws.onopen = () => {
      if (!disposed) ws.send(JSON.stringify({ event: "AUTH", token: accessToken }));
    };

    ws.onmessage = (msg) => {
      try {
        const ev = JSON.parse(msg.data as string) as RawEvent;
        if (ev.event === "ROOM_CONNECTED") {
          openRooms.add(room);
          emitConnectionStatus("connected");
          return;
        }
        eventListeners.forEach((listener) => listener(ev));
        if (room === "notifications") {
          const notification = toNotification(ev);
          if (notification) addNotification(notification);
        }
      } catch {
        // Ignore malformed frames.
      }
    };
    ws.onerror = () => ws.close();
    ws.onclose = () => {
      sockets.delete(room);
      openRooms.delete(room);
      if (!disposed) {
        emitConnectionStatus(openRooms.size > 0 ? "connected" : "connecting");
        scheduleReconnect(room);
      }
    };
  };

  rooms.forEach(open);

  return () => {
    disposed = true;
    timers.forEach(clearTimeout);
    timers.clear();
    sockets.forEach((socket) => socket.close());
    sockets.clear();
    openRooms.clear();
    emitConnectionStatus("disconnected");
  };
}
