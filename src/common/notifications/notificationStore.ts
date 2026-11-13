import { create } from "zustand";

export type NotificationType = "info" | "order" | "staff" | "system" | "warning";

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  type?: NotificationType;
  createdAt: string;
  read?: boolean;
}

type NotificationState = {
  scope: string | null;
  notifications: AppNotification[];
  setScope: (scope: string | null) => void;
  addNotification: (
    n: Pick<AppNotification, "title" | "body" | "type">
  ) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
};

function storageKey(scope: string): string {
  return `aharqr-notifications:${encodeURIComponent(scope)}`;
}

function readNotifications(scope: string | null): AppNotification[] {
  if (!scope || typeof localStorage === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey(scope));
    if (!stored) return [];
    const value: unknown = JSON.parse(stored);
    if (
      typeof value === "object" &&
      value !== null &&
      "notifications" in value &&
      Array.isArray(value.notifications)
    ) {
      return value.notifications as AppNotification[];
    }
  } catch {
    return [];
  }
  return [];
}

function persist(scope: string | null, notifications: AppNotification[]) {
  if (!scope || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify({ notifications }));
  } catch {
    // Notification history is best-effort when browser storage is unavailable.
  }
}

export const useNotificationStore = create<NotificationState>((set) => ({
  scope: null,
  notifications: [],
  setScope: (scope) =>
    set((state) =>
      state.scope === scope
        ? state
        : { scope, notifications: readNotifications(scope) },
    ),
  addNotification: (n) =>
    set((state) => {
      const notification: AppNotification = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
        type: n.type ?? "info",
        ...n,
      };
      const notifications = [notification, ...state.notifications].slice(0, 100);
      persist(state.scope, notifications);
      return { notifications };
    }),
  markAllRead: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({
        ...item,
        read: true,
      }));
      persist(state.scope, notifications);
      return { notifications };
    }),
  remove: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((item) => item.id !== id);
      persist(state.scope, notifications);
      return { notifications };
    }),
  clearAll: () =>
    set((state) => {
      persist(state.scope, []);
      return { notifications: [] };
    }),
}));
