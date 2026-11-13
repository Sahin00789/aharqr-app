import { useSyncExternalStore } from "react";
import {
  getNotificationConnectionStatus,
  getOpenRoomCount,
  subscribeNotificationConnection,
  type NotificationConnectionStatus,
} from "./notificationSocket";

/** Live status of the restaurant webhook WebSocket rooms. */
export function useNotificationConnectionStatus(): NotificationConnectionStatus {
  return useSyncExternalStore(
    subscribeNotificationConnection,
    getNotificationConnectionStatus,
    () => "disconnected" as const,
  );
}

/** How many webhook rooms are currently open (0 while offline/reconnecting). */
export function useOpenRoomCount(): number {
  return useSyncExternalStore(
    subscribeNotificationConnection,
    getOpenRoomCount,
    () => 0,
  );
}
