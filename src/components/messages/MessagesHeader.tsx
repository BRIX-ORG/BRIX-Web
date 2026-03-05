'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Settings, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BrixBrandLogo } from '@/components/shared';
import { cn } from '@/utils/classnames';
import { getAvatarUrl } from '@/utils/cloudinary';
import { useGetTotalUnread } from '@/hooks/apis/message.api';
import { useChatStore } from '@/stores/chat-store';

const navLinks = [
    { href: '/dashboard/feed', label: 'CHANNELS' },
    { href: '/messages', label: 'MESSAGES' },
    { href: '/dashboard/network', label: 'NETWORK' },
    { href: '/dashboard/archive', label: 'VAULT' },
];

export function MessagesHeader() {
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
                {/* Search Bar */}
                <div className="hidden lg:flex items-center bg-muted border border-border px-3 py-1.5 rounded">
                    <Search className="size-4 text-primary mr-2" />
                    <input
                        className="bg-transparent border-none text-[10px] p-0 focus:ring-0 placeholder:text-muted-foreground w-48 font-bold outline-none"
                        placeholder="CMD+K TO SEARCH"
                        type="text"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button className="size-10 flex items-center justify-center rounded bg-muted border border-border hover:border-primary transition-all">
                        <Settings className="size-5" />
                    </button>
                    <Link
                        href={session?.user ? `/dashboard/artist/${session.user.username}` : '#'}
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
    );
}
