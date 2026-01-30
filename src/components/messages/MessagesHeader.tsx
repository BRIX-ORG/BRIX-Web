'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Search } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';
import { cn } from '@/types/utils';
import Image from 'next/image';

const navLinks = [
    { href: '/dashboard/feed', label: 'CHANNELS' },
    { href: '/dashboard/messages', label: 'MESSAGES' },
    { href: '/dashboard/network', label: 'NETWORK' },
    { href: '/dashboard/archive', label: 'VAULT' },
];

export function MessagesHeader() {
    const pathname = usePathname();

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
                                'hover:text-primary transition-colors uppercase',
                                pathname === link.href &&
                                    'text-primary underline underline-offset-8',
                            )}
                        >
                            {link.label}
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
                    <div className="size-10 rounded bg-primary/20 border border-primary/50 overflow-hidden">
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW0VCSYVMIckTPuZHyAdl8YSlERy4EN6uxTtrFsPPxB_PT67kWuQ2okWETg-Ly6gCzeYvjEkJpoe4jFdo2iQvt56VZvxVf2lRzSoglbbZ9r0GZkrxt68ADJmgcXo7VGhucpuidAaHQtugZm2DDF5DikAKsr9oL30OMDzkGlnAUhFVoN0zCMYek-n9U-nHqO-fSdstSBC5eM4ogbK3uXhkXQV0UqnVNzqH8DSNPcdMyyF5F4uEuCL7K1gu9l13ky7fsEDneaFezsi0"
                            alt="User avatar"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
