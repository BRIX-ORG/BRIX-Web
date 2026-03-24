'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Settings, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BrixBrandLogo, LanguageSwitcher } from '@/components/shared';
import { SearchModal } from '@/components/search';
import { cn } from '@/utils/classnames';
import { getAvatarUrl } from '@/utils/cloudinary';
import { useGetTotalUnread } from '@/hooks/apis/message.api';
import { useChatStore } from '@/stores/chat-store';
import { useTranslations } from 'next-intl';

export function MessagesHeader() {
    const t = useTranslations('messages.MessagesHeader');
    const navLinks = [
        { href: '/dashboard', label: t('nav.map') },
        { href: '/dashboard/trending', label: t('nav.trending') },
        { href: '/dashboard/archive', label: t('nav.archive') },
        { href: '/messages', label: t('nav.messages') },
        { href: '/dashboard/network', label: t('nav.network') },
    ];
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const totalUnread = useChatStore((s) => s.totalUnread);
    const setTotalUnread = useChatStore((s) => s.setTotalUnread);

    const { data: unreadData } = useGetTotalUnread();

    // Sync total unread to store via effect
    useEffect(() => {
        if (unreadData) {
            setTotalUnread(unreadData.totalUnread);
        }
    }, [unreadData, setTotalUnread]);

    const avatarUrl = session?.user
        ? getAvatarUrl(session.user.avatar, session.user.gender)
        : undefined;

    return (
        <>
            <header className="flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-3 z-50">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <BrixBrandLogo href="/dashboard" size="sm" animated />

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-muted-foreground">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'relative hover:text-primary transition-colors uppercase',
                                    pathname === link.href &&
                                        'text-primary underline underline-offset-8',
                                )}
                            >
                                {link.label}
                                {link.href === '/messages' && totalUnread > 0 && (
                                    <span className="absolute -top-1.5 -right-4 size-4 flex items-center justify-center bg-primary text-primary-foreground text-[8px] font-black rounded-full">
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Bar — opens SearchModal on click */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden lg:flex items-center bg-muted border border-border px-3 py-1.5 rounded hover:border-primary/40 transition-colors"
                    >
                        <Search className="size-4 text-primary mr-2" />
                        <span className="text-[10px] text-muted-foreground/50 font-bold">
                            {t('searchPlaceholder')}
                        </span>
                    </button>

                    {/* Actions */}
                    <div className="flex gap-2 items-center">
                        <LanguageSwitcher />
                        <button className="size-10 flex items-center justify-center rounded bg-muted border border-border hover:border-primary transition-all">
                            <Settings className="size-5" />
                        </button>
                        <Link
                            href={
                                session?.user ? `/dashboard/artist/${session.user.username}` : '#'
                            }
                            className="size-10 rounded bg-primary/20 border border-primary/50 overflow-hidden"
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={session?.user?.username || 'User'}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted" />
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
