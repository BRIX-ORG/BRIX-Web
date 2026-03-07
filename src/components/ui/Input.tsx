'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    variant?: 'standard' | 'compact';
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            label,
            variant = 'standard',
            error,
            helperText,
            disabled,
            leftIcon,
            rightIcon,
            showPasswordToggle = false,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;
        const isStandard = variant === 'standard';
        const hasRightContent = (isPassword && showPasswordToggle) || rightIcon;

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label
                        className={`block text-xs font-mono font-medium uppercase tracking-[0.2em] ${
                            disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
                        }`}
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5 flex items-center justify-center z-10 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={inputType}
                        disabled={disabled}
                        ref={ref}
                        className={`
                            w-full bg-muted border rounded-sm font-cabin text-foreground
                            placeholder:text-muted-foreground/50 placeholder:font-normal
                            focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)]
                            transition-all
                            ${isStandard ? 'py-4 text-sm' : 'py-3 text-sm'}
                            ${leftIcon ? 'pl-12' : 'pl-4'}
                            ${hasRightContent ? 'pr-12' : 'pr-4'}
                            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-border'}
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${className || ''}
                        `}
                        {...props}
                    />
                    {rightIcon && !isPassword && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5 flex items-center justify-center z-10">
                            {rightIcon}
                        </div>
                    )}
                    {isPassword && showPasswordToggle && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeOff className="size-5" />
                            ) : (
                                <Eye className="size-5" />
                            )}
                        </button>
                    )}
                </div>
                {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
                {helperText && !error && (
                    <p className="text-xs text-muted-foreground/70">{helperText}</p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
