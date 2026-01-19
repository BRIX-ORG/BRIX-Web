'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ChevronLeft } from 'lucide-react';

export function RecoveryForm() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement recovery logic
        console.log('Recovery:', { email });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="space-y-6">
                {/* Success Message */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        RESET_LINK_DISPATCHED
                    </p>
                    <p className="text-sm text-foreground">
                        Check your email for recovery instructions.
                    </p>
                </div>

                {/* Verification Hash Display */}
                <div className="p-4 bg-background/50 border border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        SYSTEM_VERIFICATION_HASH:
                    </p>
                    <div className="font-mono text-primary text-sm break-all leading-relaxed">
                        BRX-992-X10-LY-SECURE-BETA-7729
                    </div>
                </div>

                {/* Back Button */}
                <Link
                    href="/login"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary text-sm font-medium transition-colors group"
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Registered_Email
                </label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-muted border border-border rounded-sm py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all font-mono text-sm"
                        placeholder="name@company.com"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
                <span>Send Reset Link</span>
                <ArrowRight className="size-4" />
            </button>

            {/* Back Link */}
            <div className="flex justify-center">
                <Link
                    href="/login"
                    className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
            </div>
        </form>
    );
}
