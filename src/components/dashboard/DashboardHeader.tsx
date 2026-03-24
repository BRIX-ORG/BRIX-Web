'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Camera, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BrixBrandLogo, LanguageSwitcher } from '@/components/shared';
import { getAvatarUrl } from '@/utils/cloudinary';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import { SearchModal } from '@/components/search';

const WalletButton = dynamic(() => import('@/components/wallet').then((mod) => mod.WalletButton), {
    ssr: false,
});

interface DashboardHeaderProps {
    onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const t = useTranslations('navigation.header');
    const { data: session } = useSession();
    const user = session?.user;
    const avatarUrl = user ? getAvatarUrl(user.avatar, user.gender) : null;

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-primary/20 bg-background/80 backdrop-blur-md px-3 md:px-6 py-3">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Menu className="size-6" />
                    </button>
                    {/* Logo - visible on mobile */}
                    <div className="lg:hidden shrink-0">
                        <BrixBrandLogo href="/dashboard" size="xs" animated />
                    </div>

                    {/* Page Title - visible on desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tight uppercase">
                            BRIX <span className="text-primary/50 font-light">{t('explore')}</span>
                        </h2>
                    </div>

                    {/* Search Bar — opens SearchModal on click */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden md:flex flex-col min-w-48 lg:min-w-64 h-9 cursor-text"
                        aria-label={t('searchPlaceholder')}
                    >
                        <div className="flex w-full flex-1 items-stretch rounded border border-border bg-muted h-full group hover:border-primary/40 transition-colors">
                            <div className="text-muted-foreground flex items-center justify-center pl-3">
                                <Search className="size-4" />
                            </div>
                            <span className="flex w-full min-w-0 flex-1 items-center px-3 text-sm text-muted-foreground/50 select-none">
                                {t('searchPlaceholder')}
                            </span>
                            <div className="flex items-center pr-3 gap-1">
                                <kbd className="text-[10px] font-mono border border-border/60 px-1 py-0.5 rounded text-muted-foreground/40 hidden lg:block">
                                    /
                                </kbd>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2 md:gap-3 border-l border-border pl-3 md:pl-6">
                        {/* Language Switcher - Hidden on mobile to save space */}
                        <div className="hidden sm:flex items-center">
                            <LanguageSwitcher />
                        </div>

                        {/* Mobile search icon */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Search"
                        >
                            <Search className="size-5" />
                        </button>

                        {/* Camera Button */}
                        <Link
                            href="/camera"
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-tighter hover:brightness-110 transition-all h-9"
                        >
                            <Camera className="size-4" />
                            <span className="hidden sm:inline">{t('camera')}</span>
                        </Link>

                        {/* Wallet Button */}
                        <WalletButton />

                        {/* Notifications Bell */}
                        <NotificationPopover />

                        {/* User Avatar */}
                        <Link
                            href={
                                user ? `/dashboard/artist/${user.username}` : '/dashboard/settings'
                            }
                            className="size-9 rounded-full bg-cover bg-center border border-primary/30 overflow-hidden hover:border-primary/60 transition-colors"
                        >
                            {avatarUrl && (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.username ?? t('userAvatar')}
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Global keyboard shortcut: "/" to open search */}
            <KeyboardShortcut onOpen={() => setIsSearchOpen(true)} />

            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

/** Listen for "/" keypress outside input/textarea to open search */
function KeyboardShortcut({ onOpen }: { onOpen: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                (e.target as HTMLElement)?.isContentEditable
            )
                return;
            if (e.key === '/') {
                e.preventDefault();
                onOpen();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onOpen]);
    return null;
}
