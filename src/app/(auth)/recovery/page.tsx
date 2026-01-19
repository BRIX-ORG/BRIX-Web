'use client';

import Link from 'next/link';
import { BrixBrandLogo } from '@/components/shared';
import { RecoveryForm } from '@/components/auth';

export default function RecoveryPage() {
    return (
        <div className="w-full lg:w-2/5 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 relative bg-background">
            {/* Mobile Header Logo */}
            <div className="lg:hidden absolute top-10 flex items-center gap-3">
                <BrixBrandLogo href="/" size="md" animated />
            </div>

            {/* Form Container */}
            <div className="w-full max-w-md glassmorphism p-8 rounded-xl border border-border shadow-2xl relative">
                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                {/* Headline */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-2">
                        Recover_Access
                    </h2>
                    <p className="text-muted-foreground text-sm font-mono tracking-wide uppercase">
                        Reset your credentials
                    </p>
                </div>

                {/* Recovery Form */}
                <RecoveryForm />
            </div>

            {/* Footer Links */}
            <div className="mt-12 flex gap-8 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <Link className="hover:text-primary transition-colors" href="#">
                    Global_Privacy
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                    Term_Protocols
                </Link>
                <span className="opacity-40">©2024_BRIX_GRID</span>
            </div>
        </div>
    );
}
