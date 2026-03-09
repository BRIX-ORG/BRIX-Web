'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
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
    const { data: session } = useSession();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = session?.accessToken;
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return () => setIsConnected(false);
        }

        const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        socketRef.current = socket;

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // ─── Server-to-Client Events ─────────────────────────────

        socket.on('notification', (notification: SocketNotificationEvent) => {
            useNotificationStore.getState().addNotification(notification);
        });

        socket.on('notificationUpdated', (update: SocketNotificationUpdatedEvent) => {
            useNotificationStore.getState().updateNotification(update);
        });

        socket.on('unreadCount', (data: SocketUnreadCountEvent) => {
            useNotificationStore.getState().setUnreadCount(data.count);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [session?.accessToken]);

    return (
        <NotificationSocketContext.Provider value={{ isConnected }}>
            {children}
        </NotificationSocketContext.Provider>
    );
}
