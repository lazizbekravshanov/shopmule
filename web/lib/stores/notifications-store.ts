import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

let notificationId = 0;

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `notification-${++notificationId}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 5000,
    };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, newNotification.duration);
    }

    return id;
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

// Helper hooks
export function useNotify() {
  const addNotification = useNotificationsStore((state) => state.addNotification);

  return {
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message }),
  };
}
