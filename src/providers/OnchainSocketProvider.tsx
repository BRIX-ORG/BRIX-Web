'use client';

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

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
    const { socket, isConnected } = useSocket({ namespace: '/onchain' });

    // Sets of handlers per event - use ref so registrations survive re-renders
    const ipfsHandlersRef = useRef<Set<IpfsUploadedHandler>>(new Set());
    const mintHandlersRef = useRef<Set<BrickMintedHandler>>(new Set());

    useEffect(() => {
        if (!socket) return;

        const handleIpfsUploaded = (data: IpfsUploadedEvent) => {
            for (const handler of ipfsHandlersRef.current) {
                handler(data);
            }
        };

        const handleBrickMinted = (data: BrickMintedEvent) => {
            for (const handler of mintHandlersRef.current) {
                handler(data);
            }
        };

        socket.on('ipfs_uploaded', handleIpfsUploaded);
        socket.on('brick_minted', handleBrickMinted);

        return () => {
            socket.off('ipfs_uploaded', handleIpfsUploaded);
            socket.off('brick_minted', handleBrickMinted);
        };
    }, [socket]);

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
