'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/stores/notification-store';
import type {
    SocketNotificationEvent,
    SocketNotificationUpdatedEvent,
    SocketUnreadCountEvent,
} from '@/types/notification.types';

// ─── Context ────────────────────────────────────────────────────

interface NotificationSocketContextValue {
    isConnected: boolean;
}

const NotificationSocketContext = createContext<NotificationSocketContextValue>({
    isConnected: false,
});

export function useNotificationSocket() {
    return useContext(NotificationSocketContext);
}

// ─── Provider ───────────────────────────────────────────────────

interface NotificationSocketProviderProps {
    children: ReactNode;
}

export function NotificationSocketProvider({ children }: NotificationSocketProviderProps) {
    const { socket, isConnected } = useSocket({ namespace: '/notifications' });

    useEffect(() => {
        if (!socket) return;

        // ─── Server-to-Client Events ─────────────────────────────

        const handleNotification = (notification: SocketNotificationEvent) => {
            useNotificationStore.getState().addNotification(notification);
        };

        const handleNotificationUpdated = (update: SocketNotificationUpdatedEvent) => {
            useNotificationStore.getState().updateNotification(update);
        };

        const handleUnreadCount = (data: SocketUnreadCountEvent) => {
            useNotificationStore.getState().setUnreadCount(data.count);
        };

        socket.on('notification', handleNotification);
        socket.on('notificationUpdated', handleNotificationUpdated);
        socket.on('unreadCount', handleUnreadCount);

        return () => {
            socket.off('notification', handleNotification);
            socket.off('notificationUpdated', handleNotificationUpdated);
            socket.off('unreadCount', handleUnreadCount);
        };
    }, [socket]);

    return (
        <NotificationSocketContext.Provider value={{ isConnected }}>
            {children}
        </NotificationSocketContext.Provider>
    );
}
