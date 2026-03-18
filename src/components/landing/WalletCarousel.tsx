'use client';

import { LogoLoop } from '@/components/react-bits/LogoLoop';

const WALLET_LOGOS = [
    { src: '/images/MetaMask.png', alt: 'MetaMask', href: 'https://metamask.io/' },
    { src: '/images/TrustWallet.png', alt: 'Trust Wallet', href: 'https://trustwallet.com/' },
    { src: '/images/BraveWallet.png', alt: 'Brave Wallet', href: 'https://brave.com/wallet/' },
    {
        src: '/images/CoinBaseWallet.png',
        alt: 'Coinbase Wallet',
        href: 'https://wallet.coinbase.com/',
    },
    { src: '/images/MetaMask.png', alt: 'MetaMask', href: 'https://metamask.io/' },
    { src: '/images/TrustWallet.png', alt: 'Trust Wallet', href: 'https://trustwallet.com/' },
    { src: '/images/BraveWallet.png', alt: 'Brave Wallet', href: 'https://brave.com/wallet/' },
    {
        src: '/images/CoinBaseWallet.png',
        alt: 'Coinbase Wallet',
        href: 'https://wallet.coinbase.com/',
    },
];

export function WalletCarousel() {
    return (
        <section className="py-16 border-y border-primary/10 bg-muted/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">
                    Reliable Infrastructure
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground/90">
                    Trusted by the World's Leading{' '}
                    <span className="text-primary italic">Wallets</span>
                </h2>
            </div>

            <div className="relative">
                <LogoLoop
                    logos={WALLET_LOGOS}
                    speed={50}
                    direction="left"
                    logoHeight={50}
                    gap={100}
                    hoverSpeed={0}
                    scaleOnHover
                    fadeOut
                    ariaLabel="Supported Web3 Wallets"
                />
            </div>
        </section>
    );
}
