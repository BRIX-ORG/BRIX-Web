import Link from 'next/link';
import { Terminal, Network } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';

const footerLinks = [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Documentation' },
];

export function Footer() {
    return (
        <footer className="py-12  border-t border-border">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Logo */}
                <BrixBrandLogo href="/" size="sm" animated />

                {/* Links */}
                <div className="flex gap-8 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Social Icons */}
                <div className="flex gap-4">
                    <Link
                        href="#"
                        className="size-10 border border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <Terminal className="size-4" />
                    </Link>
                    <Link
                        href="#"
                        className="size-10 border border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                        <Network className="size-4" />
                    </Link>
                </div>
            </div>

            {/* Copyright */}
            <p className="text-center font-mono text-[9px] text-muted-foreground mt-12 uppercase tracking-[0.5em]">
                © 2026 BRIX Immutable Network. All Rights Verified.
            </p>
        </footer>
    );
}
