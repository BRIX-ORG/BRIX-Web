'use client';

import { useState } from 'react';
import { useConnection, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Wallet, Unlink, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import {
    useGetWallets,
    useGetWalletNonce,
    useLinkWallet,
    useUnlinkWallet,
} from '@/hooks/apis/wallet.api';
import type { Wallet as WalletType } from '@/types/wallet.types';
import { cn } from '@/utils/classnames';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

export function WalletButton() {
    const t = useTranslations('wallet');
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
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        void navigator.clipboard.writeText(text);
        setCopiedAddress(text);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

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
            toast.success(t('linkSuccess'));
            setShowDropdown(false);
        } catch (error: unknown) {
            console.error('Failed to link wallet:', error);
            // Provide better feedback if wallet is already linked to another account
            let errorMessage = t('linkError');

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
                <span className="hidden sm:inline">{t('connect')}</span>
            </button>
        );
    }

    // Connected - show wallet info
    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                    'flex items-center gap-2 px-3 md:px-4 py-1.5 rounded text-xs font-bold transition-all h-9 group/wallet',
                    linkedWallet
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20',
                )}
            >
                <div className="relative">
                    <Wallet className="size-4" />
                    {linkedWallet && (
                        <div className="absolute -top-1 -right-1 size-2 bg-green-500 rounded-full border border-background shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    )}
                </div>
                <span className="hidden sm:inline font-mono tracking-tight">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t('connect')}
                </span>
                {isLoadingWallets || isLinking ? (
                    <Loader2 className="size-3.5 animate-spin opacity-50" />
                ) : linkedWallet ? (
                    <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/20 text-[9px] uppercase tracking-wider">
                        <span className="size-1 bg-green-400 rounded-full animate-pulse" />
                        {t('linked')}
                    </div>
                ) : (
                    <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-[9px] uppercase tracking-wider">
                        <span className="size-1 bg-yellow-400 rounded-full" />
                        {t('unlinked')}
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Linked Wallets */}
                    <div className="p-3 space-y-3">
                        {/* Current Active Wallet */}
                        {address && (
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                    {t('current')}
                                </p>
                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <span className="text-xs font-mono font-bold text-foreground">
                                                {address.slice(0, 6)}...{address.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => copyToClipboard(address)}
                                                className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                                title={t('copy')}
                                            >
                                                {copiedAddress === address ? (
                                                    <Check className="size-3 text-green-500" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                            </button>
                                            <a
                                                href={`https://amoy.polygonscan.com/address/${address}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                                title={t('explorer')}
                                            >
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                    {linkedWallet && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded text-[10px] text-green-400 font-medium">
                                            <Check className="size-3" />
                                            {t('verifiedOwner')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {wallets.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                    {t('yourWallets')}
                                </p>
                                <div className="space-y-1.5">
                                    {wallets.map((wallet: WalletType) => {
                                        const isActive =
                                            wallet.address.toLowerCase() === address?.toLowerCase();
                                        if (isActive) return null;

                                        return (
                                            <div
                                                key={wallet.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/card"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="size-3.5 text-primary opacity-70" />
                                                    <span className="text-xs font-mono text-muted-foreground group-hover/card:text-foreground transition-colors">
                                                        {wallet.address.slice(0, 6)}...
                                                        {wallet.address.slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(wallet.address)
                                                        }
                                                        className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-foreground"
                                                        title={t('copy')}
                                                    >
                                                        {copiedAddress === wallet.address ? (
                                                            <Check className="size-2.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="size-2.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnlink(wallet.id);
                                                        }}
                                                        className="p-1 hover:bg-destructive/10 rounded transition-colors text-destructive"
                                                        title="Unlink Wallet"
                                                    >
                                                        <Unlink className="size-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                        {!linkedWallet && (
                            <div className="p-2 pt-0">
                                <div className="px-2 py-2 bg-yellow-500/10 rounded-lg mb-2 border border-yellow-500/20">
                                    <p className="text-[10px] text-yellow-400 font-medium leading-tight">
                                        {t('notLinkedMsg')}
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
                                    {t('linkWallet')}
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => disconnect()}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                            <Unlink className="size-4" />
                            {t('disconnect')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
