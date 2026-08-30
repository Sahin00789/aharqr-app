import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  notifications: AppNotification[];
  addNotification: (
    n: Pick<AppNotification, "title" | "body" | "type">
  ) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
};

/** Device-local notification log. Persisted to localStorage (never sent to the
 * backend) and fully clearable, per product requirement. */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              createdAt: new Date().toISOString(),
              read: false,
              type: n.type ?? "info",
              ...n,
            },
            ...s.notifications,
          ].slice(0, 100),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((x) => ({ ...x, read: true })),
        })),
      remove: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((x) => x.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: "aharq-notifications", version: 1 }
  )
);
