'use client';

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// ─── Event Types ────────────────────────────────────────────────

export interface IpfsUploadedEvent {
    brickId: string;
    imageCid: string;
    ipfsCid: string;
    hashSha256: string;
}

export interface BrickMintedEvent {
    brickId: string;
    txHash: string;
}

type IpfsUploadedHandler = (data: IpfsUploadedEvent) => void;
type BrickMintedHandler = (data: BrickMintedEvent) => void;

// ─── Context ────────────────────────────────────────────────────

interface OnchainSocketContextValue {
    isConnected: boolean;
    /** Register a handler for ipfs_uploaded. Returns a cleanup function. */
    onIpfsUploaded: (handler: IpfsUploadedHandler) => () => void;
    /** Register a handler for brick_minted. Returns a cleanup function. */
    onBrickMinted: (handler: BrickMintedHandler) => () => void;
}

const OnchainSocketContext = createContext<OnchainSocketContextValue>({
    isConnected: false,
    onIpfsUploaded: () => () => {},
    onBrickMinted: () => () => {},
});

export function useOnchainSocket() {
    return useContext(OnchainSocketContext);
}

// ─── Provider ───────────────────────────────────────────────────

interface OnchainSocketProviderProps {
    children: ReactNode;
}

export function OnchainSocketProvider({ children }: OnchainSocketProviderProps) {
    const { data: session } = useSession();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Sets of handlers per event - use ref so registrations survive re-renders
    const ipfsHandlersRef = useRef<Set<IpfsUploadedHandler>>(new Set());
    const mintHandlersRef = useRef<Set<BrickMintedHandler>>(new Set());

    useEffect(() => {
        const token = session?.accessToken;
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return () => setIsConnected(false);
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

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('ipfs_uploaded', (data: IpfsUploadedEvent) => {
            for (const handler of ipfsHandlersRef.current) {
                handler(data);
            }
        });

        socket.on('brick_minted', (data: BrickMintedEvent) => {
            for (const handler of mintHandlersRef.current) {
                handler(data);
            }
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [session?.accessToken]);

    const onIpfsUploaded = useCallback((handler: IpfsUploadedHandler) => {
        ipfsHandlersRef.current.add(handler);
        return () => {
            ipfsHandlersRef.current.delete(handler);
        };
    }, []);

    const onBrickMinted = useCallback((handler: BrickMintedHandler) => {
        mintHandlersRef.current.add(handler);
        return () => {
            mintHandlersRef.current.delete(handler);
        };
    }, []);

    return (
        <OnchainSocketContext.Provider value={{ isConnected, onIpfsUploaded, onBrickMinted }}>
            {children}
        </OnchainSocketContext.Provider>
    );
}
