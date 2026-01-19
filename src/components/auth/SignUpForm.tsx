'use client';

import { useState } from 'react';
import { Mail, Lock, User, Zap } from 'lucide-react';

export function SignUpForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement signup logic
        console.log('Sign Up:', { name, email, password, confirmPassword });
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    User_Alias
                </label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-sm py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all font-mono text-sm"
                        placeholder="ENTER_YOUR_NAME"
                    />
                </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Access_ID
                </label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-muted border border-border rounded-sm py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all font-mono text-sm"
                        placeholder="ENTER_EMAIL_IDENTITY"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Security_Key
                </label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-muted border border-border rounded-sm py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all font-mono text-sm"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Confirm_Key
                </label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-muted border border-border rounded-sm py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all font-mono text-sm"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-[0.15em] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <span>Create_Account</span>
                    <Zap className="size-4" />
                </button>
            </div>
        </form>
    );
}
