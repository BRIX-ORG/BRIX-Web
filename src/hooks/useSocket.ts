'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';

interface UseSocketOptions {
    namespace: string;
}

export function useSocket({ namespace }: UseSocketOptions) {
    const { data: session, update } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const connectAttemptRef = useRef(0);

    useEffect(() => {
        const token = session?.accessToken;
        if (!token) {
            return;
        }

        const socketUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${namespace}`;
        const socketInstance = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            setIsConnected(true);
            connectAttemptRef.current = 0; // Reset on successful connect
        });

        socketInstance.on('disconnect', async (reason) => {
            setIsConnected(false);

            // 'io server disconnect' means the server explicitly disconnected the socket
            // (e.g., due to an invalid/expired token in handleConnection).
            // When this happens, socket.io STOPS auto-reconnecting.
            if (reason === 'io server disconnect') {
                try {
                    connectAttemptRef.current += 1;

                    // Stop trying if we fail consecutively too many times to prevent infinite loops
                    if (connectAttemptRef.current > 3) {
                        console.error(`[Socket] Max reconnect attempts reached for ${namespace}`);
                        return;
                    }

                    // 1. Piggyback on api-client interceptor to trigger token refresh if needed.
                    // A simple request to an authenticated endpoint will fail with 401,
                    // api-client will catch it, refresh the token, and resolve it.
                    await apiClient.get('/users/me').catch(() => null);

                    // 2. Update NextAuth session in the client to get the newly refreshed token
                    await update();

                    // 3. Reconnect manually (with a slight delay to allow session to sync)
                    setTimeout(() => {
                        socketInstance.connect();
                    }, 1000);
                } catch (error) {
                    console.error(
                        `[Socket] Failed to refresh token and reconnect to ${namespace}:`,
                        error,
                    );
                }
            }
        });

        return () => {
            socketInstance.removeAllListeners();
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [session?.accessToken, namespace, update]);

    return { socket, isConnected };
}
