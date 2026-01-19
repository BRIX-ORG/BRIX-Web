'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, Upload, Menu } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';

const navLinks = [
    { href: '/dashboard/feed', label: 'Feed', active: true },
    { href: '/dashboard/trending', label: 'Trending' },
    { href: '/dashboard/vault', label: 'Vault' },
];

interface DashboardHeaderProps {
    onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-primary/20 bg-background/80 backdrop-blur-md px-4 md:px-6 py-3">
            <div className="flex items-center gap-4 md:gap-8">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="size-6" />
                </button>

                {/* Logo - visible on mobile */}
                <div className="lg:hidden">
                    <BrixBrandLogo href="/dashboard" size="sm" animated />
                </div>

                {/* Page Title - visible on desktop */}
                <div className="hidden lg:flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight uppercase">
                        BRIX <span className="text-primary/50 font-light">Explore</span>
                    </h2>
                </div>

                {/* Search Bar */}
                <label className="hidden md:flex flex-col min-w-48 lg:min-w-64 h-9">
                    <div className="flex w-full flex-1 items-stretch rounded border border-border bg-muted h-full group focus-within:border-primary/50 transition-colors">
                        <div className="text-muted-foreground flex items-center justify-center pl-3">
                            <Search className="size-4" />
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded bg-transparent border-none focus:ring-0 focus:outline-none text-sm placeholder:text-muted-foreground/50 px-3"
                            placeholder="Search hash, location, or tag..."
                        />
                    </div>
                </label>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Navigation Links */}
                <nav className="hidden xl:flex items-center gap-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`hover:text-primary transition-colors ${link.active ? 'text-primary' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex gap-2 md:gap-3 border-l border-border pl-3 md:pl-6">
                    {/* Upload Button */}
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-tighter hover:brightness-110 transition-all">
                        <Upload className="size-4" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>

                    {/* Notifications */}
                    <button className="size-9 flex items-center justify-center rounded border border-border bg-muted hover:bg-muted/80 transition-colors">
                        <Bell className="size-4" />
                    </button>

                    {/* User Avatar */}
                    <div className="size-9 rounded bg-cover bg-center border border-primary/30 overflow-hidden">
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuANHBj7oUI2fcHJIJH9-wi7wVfxWfSRPYpQe8ZE9m62xK8PkdQ4yNaVuUO0gCe0eJ1RW-jObnk_9LmpSnlBzg056JP5n7v7fjkjOmN4MFC6LkEe6GnJ9u5fMvGLpbuluycrF01uzTWi9St7NVWu-rp5sxGNZi1NWWy7Kpv-kgElWhouY9dlI4L_BQwcZCI_3dBF257ImU0v1kbeM03F7l9frNSNEReQxiLX_sGcavfrnZl59McdRvNnkbTQ8_C_idR-GEBXJEcZgCc"
                            alt="User avatar"
                            width={36}
                            height={36}
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
