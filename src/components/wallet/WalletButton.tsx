'use client';

import { useState } from 'react';
import { useConnection, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Wallet, Unlink, Loader2 } from 'lucide-react';
import {
    useGetWallets,
    useGetWalletNonce,
    useLinkWallet,
    useUnlinkWallet,
} from '@/hooks/apis/wallet.api';
import type { Wallet as WalletType } from '@/types/wallet.types';
import { cn } from '@/utils/classnames';
import { toast } from 'react-toastify';

export function WalletButton() {
    const { status, address } = useConnection();
    const isConnected = status === 'connected';
    const { openConnectModal } = useConnectModal();
    const { mutate: disconnect } = useDisconnect();
    const { mutateAsync: signMessageAsync } = useSignMessage();

    const { data: wallets = [], isLoading: isLoadingWallets } = useGetWallets();
    const { data: nonceData } = useGetWalletNonce();
    const linkWallet = useLinkWallet();
    const unlinkWallet = useUnlinkWallet();

    const [showDropdown, setShowDropdown] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    // Check if current wallet is linked
    const linkedWallet = wallets.find((w) => w.address.toLowerCase() === address?.toLowerCase());

    const handleLink = async () => {
        if (!address || !nonceData || isLinking) return;

        setIsLinking(true);
        try {
            // Sign message
            const signature = await signMessageAsync({ message: nonceData.nonce });

            // Link wallet
            await linkWallet.mutateAsync({
                address: address,
                signature: signature,
                message: nonceData.nonce,
            });
            toast.success('Wallet linked successfully!');
            setShowDropdown(false);
        } catch (error: unknown) {
            console.error('Failed to link wallet:', error);
            // Provide better feedback if wallet is already linked to another account
            let errorMessage =
                'Failed to link wallet. It might already be linked to another account.';

            if (error instanceof Error) {
                // Check if it's an axios-like error with response data
                const errorWithResponse = error as { response?: { data?: { message?: string } } };
                if (errorWithResponse.response?.data?.message) {
                    errorMessage = errorWithResponse.response.data.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlink = async (walletId: string) => {
        await unlinkWallet.mutateAsync(walletId);
    };

    const handleConnect = () => {
        openConnectModal?.();
    };

    // Not connected - show connect button
    if (!isConnected) {
        return (
            <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-tighter hover:brightness-110 transition-all h-9"
            >
                <Wallet className="size-4" />
                <span className="hidden sm:inline">Connect</span>
            </button>
        );
    }

    // Connected - show wallet info
    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                    'flex items-center gap-2 px-3 md:px-4 py-1.5 rounded text-xs font-bold transition-all h-9',
                    linkedWallet
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                )}
            >
                <Wallet className="size-4" />
                <span className="hidden sm:inline">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet'}
                </span>
                {isLoadingWallets || isLinking ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : linkedWallet ? (
                    <span className="hidden xs:inline text-[9px]">Linked</span>
                ) : (
                    <span className="hidden xs:inline text-[9px]">Unlinked</span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Linked Wallets */}
                    {wallets.length > 0 && (
                        <div className="p-2 border-b border-border">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                Linked Wallets
                            </p>
                            {wallets.map((wallet: WalletType) => (
                                <div
                                    key={wallet.id}
                                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Wallet className="size-3.5 text-primary" />
                                        <span className="text-xs font-mono text-foreground">
                                            {wallet.address.slice(0, 6)}...
                                            {wallet.address.slice(-4)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnlink(wallet.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded text-destructive transition-all"
                                    >
                                        <Unlink className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-2">
                        {!linkedWallet && (
                            <div className="p-2 pt-0">
                                <div className="px-2 py-2 bg-yellow-500/10 rounded-lg mb-2 border border-yellow-500/20">
                                    <p className="text-[10px] text-yellow-400 font-medium leading-tight">
                                        Wallet connected but not linked.
                                    </p>
                                </div>
                                <button
                                    onClick={handleLink}
                                    disabled={isLinking}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all border border-primary/20 mb-2 disabled:opacity-50"
                                >
                                    {isLinking ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Wallet className="size-3.5" />
                                    )}
                                    Link This Wallet
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => disconnect()}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                            <Unlink className="size-4" />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
