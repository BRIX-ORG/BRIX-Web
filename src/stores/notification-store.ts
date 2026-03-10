import { create } from 'zustand';
import type { NotificationGroup, SocketNotificationUpdatedEvent } from '@/types/notification.types';

interface NotificationState {
    notifications: Record<string, NotificationGroup>;
    order: string[]; // ids sorted by updatedAt desc
    unreadCount: number;
}

interface NotificationActions {
    setNotifications: (notifications: NotificationGroup[]) => void;
    mergeNotifications: (notifications: NotificationGroup[]) => void;
    addNotification: (notification: NotificationGroup) => void;
    updateNotification: (update: SocketNotificationUpdatedEvent) => void;
    removeNotification: (id: string) => void;
    setUnreadCount: (count: number) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    reset: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

const sortOrder = (notifications: Record<string, NotificationGroup>) => {
    return Object.values(notifications)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((n) => n.id);
};

const initialState: NotificationState = {
    notifications: {},
    order: [],
    unreadCount: 0,
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    ...initialState,

    setNotifications: (notifications) => {
        if (!Array.isArray(notifications)) return;
        const map: Record<string, NotificationGroup> = {};
        for (const n of notifications) {
            map[n.id] = n;
        }
        set({ notifications: map, order: sortOrder(map) });
    },

    mergeNotifications: (notifications) => {
        if (!Array.isArray(notifications)) return;
        set((state) => {
            const map = { ...state.notifications };
            for (const n of notifications) {
                map[n.id] = n;
            }
            return { notifications: map, order: sortOrder(map) };
        });
    },

    addNotification: (notification) => {
        set((state) => {
            const notifications = { ...state.notifications, [notification.id]: notification };
            const order = sortOrder(notifications);
            let unreadCount = state.unreadCount;
            if (!notification.isRead) {
                unreadCount += 1;
            }
            return { notifications, order, unreadCount };
        });
    },

    updateNotification: (update) => {
        set((state) => {
            const existing = state.notifications[update.id];
            if (!existing) return state;

            // When a notification group is updated (new actor), it should become unread
            const wasRead = existing.isRead;
            const updated: NotificationGroup = {
                ...existing,
                actorsCount: update.actorsCount,
                lastActor: update.lastActor,
                brick: update.brick ?? existing.brick,
                comment: update.comment ?? existing.comment,
                updatedAt: new Date().toISOString(),
                isRead: false, // New interaction makes it unread again
            };

            const notifications = { ...state.notifications, [update.id]: updated };
            let unreadCount = state.unreadCount;
            if (wasRead) {
                unreadCount += 1;
            }

            return { notifications, order: sortOrder(notifications), unreadCount };
        });
    },

    removeNotification: (id) => {
        set((state) => {
            const node = state.notifications[id];
            const { [id]: _removed, ...rest } = state.notifications;
            void _removed;

            let unreadCount = state.unreadCount;
            if (node && !node.isRead) {
                unreadCount = Math.max(0, unreadCount - 1);
            }

            return {
                notifications: rest,
                order: sortOrder(rest),
                unreadCount,
            };
        });
    },

    setUnreadCount: (count) => set({ unreadCount: count }),

    markAsRead: (id) => {
        set((state) => {
            const n = state.notifications[id];
            if (!n || n.isRead) return state;
            return {
                notifications: { ...state.notifications, [id]: { ...n, isRead: true } },
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        });
    },

    markAllAsRead: () => {
        set((state) => {
            const notifications = { ...state.notifications };
            for (const id of Object.keys(notifications)) {
                notifications[id] = { ...notifications[id], isRead: true };
            }
            return { notifications, unreadCount: 0 };
        });
    },

    reset: () => set(initialState),
}));
