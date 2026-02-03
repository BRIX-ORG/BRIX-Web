'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    variant?: 'standard' | 'compact';
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        { className, label, variant = 'standard', error, helperText, disabled, rows = 4, ...props },
        ref,
    ) => {
        const isStandard = variant === 'standard';

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
                <textarea
                    disabled={disabled}
                    ref={ref}
                    rows={rows}
                    className={`
                        w-full bg-muted border rounded-sm font-cabin text-foreground
                        placeholder:text-muted-foreground/50 placeholder:font-normal
                        focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)]
                        transition-all resize-none
                        ${isStandard ? 'py-4 px-4 text-sm' : 'py-3 px-4 text-sm'}
                        ${error ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-border'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${className || ''}
                    `}
                    {...props}
                />
                {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
                {helperText && !error && (
                    <p className="text-xs text-muted-foreground/70">{helperText}</p>
                )}
            </div>
        );
    },
);

Textarea.displayName = 'Textarea';
