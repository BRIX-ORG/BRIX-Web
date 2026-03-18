'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';
import { SupportedWalletsModal } from '@/components/landing';

const navLinks = [
    { href: '#concept', label: 'The Concept' },
    { href: '#artist-hub', label: 'Artist Hub' },
    { href: '#map', label: 'Real-Time Map' },
    { href: '#roadmap', label: 'Roadmap' },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/20">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <BrixBrandLogo href="/" size="md" animated />

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="font-display text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* CTA Buttons */}
                <div className="flex items-center gap-4">
                    <button className="px-6 py-2 bg-primary text-primary-foreground font-display font-bold text-xs uppercase tracking-widest hover:bg-white transition-all glow-cyan">
                        Launch App
                    </button>
                    <button
                        onClick={() => setIsWalletsModalOpen(true)}
                        className="hidden sm:block px-6 py-2 border border-secondary text-secondary font-display font-bold text-xs uppercase tracking-widest hover:bg-secondary/10 transition-all"
                    >
                        Supported Wallets
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border">
                    <nav className="flex flex-col p-6 gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="font-display text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
            {/* Supported Wallets Modal */}
            <SupportedWalletsModal
                isOpen={isWalletsModalOpen}
                onClose={() => setIsWalletsModalOpen(false)}
            />
        </header>
    );
}
