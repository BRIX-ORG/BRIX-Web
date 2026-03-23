import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

export function useOnchainSocket(brickId: string) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = session?.accessToken;
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/onchain`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            // Optionally, we could emit a 'joinBrick' event here if the backend supported rooms for specific bricks,
            // but currently the gateway emits to everyone and we filter by brickId on the client.
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Event from DistributeIpfsService
        socket.on('ipfs_uploaded', (data: { brickId: string; ipfsCid: string }) => {
            if (data.brickId === brickId) {
                // Invalidate the brick detail cache so we fetch the updated onChainStatus 'ipfs_uploaded'
                queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
            }
        });

        // Event from MintSuccessService
        socket.on('brick_minted', (data: { brickId: string; txHash: string }) => {
            if (data.brickId === brickId) {
                // Invalidate both brick details and donations
                queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
                queryClient.invalidateQueries({ queryKey: ['brick-donations', brickId] });
            }
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [session?.accessToken, brickId, queryClient]);

    return {
        isConnected,
    };
}
