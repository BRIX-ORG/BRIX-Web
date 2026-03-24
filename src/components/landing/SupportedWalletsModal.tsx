'use client';

import { createPortal } from 'react-dom';
import { X, Wallet, ShieldCheck, Zap, Coins, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import Image from 'next/image';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useTranslations } from 'next-intl';

interface SupportedWalletsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SUPPORTED_WALLETS = [
    {
        name: 'MetaMask',
        i18nKey: 'metamask',
        image: '/images/MetaMask.png',
    },
    {
        name: 'Trust Wallet',
        i18nKey: 'trust',
        image: '/images/TrustWallet.png',
    },
    {
        name: 'Brave Wallet',
        i18nKey: 'brave',
        image: '/images/BraveWallet.png',
    },
    {
        name: 'Coinbase Wallet',
        i18nKey: 'coinbase',
        image: '/images/CoinBaseWallet.png',
    },
];

const SUPPORTED_ASSETS = [
    {
        symbol: 'POL / MATIC',
        i18nKey: 'polygon',
        color: 'from-purple-500/20 to-purple-900/10',
    },
    { symbol: 'USDT / USDC', i18nKey: 'stablecoins', color: 'from-green-500/20 to-green-900/10' },
    { symbol: 'ETH', i18nKey: 'ethereum', color: 'from-blue-500/20 to-blue-900/10' },
];

export function SupportedWalletsModal({ isOpen, onClose }: SupportedWalletsModalProps) {
    const t = useTranslations('landing');
    usePreventScroll(isOpen);

    if (!isOpen) return null;

    const modal = (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-background border border-primary/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,238,255,0.15)] animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="relative px-8 py-10 bg-linear-to-br from-primary/10 via-background to-background border-b border-primary/10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Wallet className="size-6 text-primary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                            {t('SupportedWalletsModal.badge')}
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                        {t('SupportedWalletsModal.title')}{' '}
                        <span className="text-primary">{t('SupportedWalletsModal.highlight')}</span>{' '}
                        {t('SupportedWalletsModal.titleSuffix')}
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base max-w-lg leading-relaxed">
                        {t('SupportedWalletsModal.desc')}
                    </p>
                </div>

                <div className="px-8 py-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {/* Wallets Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="size-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                                {t('SupportedWalletsModal.sections.verifiedWallets')}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SUPPORTED_WALLETS.map((wallet) => (
                                <div
                                    key={wallet.name}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all group"
                                >
                                    <div className="size-10 flex items-center justify-center bg-background rounded-xl text-2xl group-hover:scale-110 transition-transform overflow-hidden p-1.5">
                                        <Image
                                            src={wallet.image}
                                            alt={wallet.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">{wallet.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {t(`SupportedWalletsModal.wallets.${wallet.i18nKey}`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payments/Assets Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Coins className="size-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                                {t('SupportedWalletsModal.sections.paymentSupport')}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {SUPPORTED_ASSETS.map((asset) => (
                                <div
                                    key={asset.symbol}
                                    className={cn(
                                        'p-4 rounded-2xl bg-linear-to-br border border-white/5',
                                        asset.color,
                                    )}
                                >
                                    <div className="text-lg font-display font-bold text-foreground mb-1">
                                        {asset.symbol}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter italic">
                                        {t(`SupportedWalletsModal.assets.${asset.i18nKey}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Infrastructure Note */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                        <Zap className="size-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed text-muted-foreground">
                            <strong className="text-foreground block mb-1 uppercase tracking-wider">
                                {t('SupportedWalletsModal.infra.title')}
                            </strong>
                            {t('SupportedWalletsModal.infra.desc')}
                        </div>
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="px-8 py-6 bg-muted/30 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <CheckCircle2 className="size-3 text-primary" />
                        {t('SupportedWalletsModal.footer.audited')}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-background text-xs font-bold uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_4_20_rgba(0,238,255,0.2)]"
                    >
                        {t('SupportedWalletsModal.footer.gotIt')}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
