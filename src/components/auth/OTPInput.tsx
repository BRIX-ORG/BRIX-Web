'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function OTPInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    autoFocus = true,
}: OTPInputProps) {
    const t = useTranslations('auth');
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const firstInputRef = useRef<HTMLInputElement | null>(null);

    // Focus first input on mount
    useEffect(() => {
        if (autoFocus) {
            requestAnimationFrame(() => firstInputRef.current?.focus());
        }
    }, [autoFocus]);

    // Sync DOM inputs with external value
    useEffect(() => {
        const chars = value.split('').slice(0, length);
        inputsRef.current.forEach((el, i) => {
            if (el) {
                el.value = chars[i] || '';
            }
        });
    }, [value, length]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
            // Only allow digits
            const inputValue = e.target.value.replace(/\D/g, '').slice(0, 1);
            e.currentTarget.value = inputValue;

            // Collect all values from refs
            const newValues: string[] = [];
            inputsRef.current.forEach((el) => {
                newValues.push(el?.value || '');
            });
            onChange(newValues.join(''));

            // Auto focus next input if a digit was entered
            if (inputValue && idx < length - 1) {
                inputsRef.current[idx + 1]?.focus();
            }
        },
        [onChange, length],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
            // Backspace: go to previous input if current is empty
            if (e.key === 'Backspace' && !e.currentTarget.value && idx > 0) {
                inputsRef.current[idx - 1]?.focus();
            }
            // Arrow keys navigation
            if (e.key === 'ArrowLeft' && idx > 0) {
                e.preventDefault();
                inputsRef.current[idx - 1]?.focus();
            }
            if (e.key === 'ArrowRight' && idx < length - 1) {
                e.preventDefault();
                inputsRef.current[idx + 1]?.focus();
            }
        },
        [length],
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            if (!pastedData) return;

            // Fill inputs with pasted data
            const chars = pastedData.split('');
            chars.forEach((char, i) => {
                if (inputsRef.current[i]) {
                    inputsRef.current[i]!.value = char;
                }
            });

            // Clear remaining inputs
            for (let i = chars.length; i < length; i++) {
                if (inputsRef.current[i]) {
                    inputsRef.current[i]!.value = '';
                }
            }

            // Update parent with new value
            onChange(pastedData.padEnd(length, '').slice(0, length).replace(/\s/g, ''));

            // Focus last filled input
            const focusIdx = Math.min(chars.length, length) - 1;
            inputsRef.current[focusIdx]?.focus();
        },
        [length, onChange],
    );

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    ref={(el) => {
                        inputsRef.current[idx] = el;
                        if (idx === 0) {
                            firstInputRef.current = el;
                        }
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    defaultValue=""
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    onFocus={handleFocus}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-xl font-mono font-bold
                        bg-muted border-2 border-border rounded-sm
                        text-foreground placeholder:text-muted-foreground/50
                        focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,238,255,0.3)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200"
                    aria-label={`${t('otpInput.ariaLabel')} ${idx + 1}`}
                />
            ))}
        </div>
    );
}
