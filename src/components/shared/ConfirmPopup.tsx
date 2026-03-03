'use client';

import { AlertTriangle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { usePreventScroll } from '@/hooks/usePreventScroll';

export type ConfirmType = 'danger' | 'warning' | 'info';

interface ConfirmPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    isLoading?: boolean;
}

const typeConfig = {
    danger: {
        icon: AlertTriangle,
        iconColor: 'text-destructive',
        iconBg: 'bg-destructive/10 border-destructive/30',
        confirmBtn:
            'bg-destructive text-destructive-foreground hover:brightness-110 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
        border: 'border-destructive/30',
    },
    warning: {
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10 border-amber-500/30',
        confirmBtn:
            'bg-amber-500 text-background hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
        border: 'border-amber-500/30',
    },
    info: {
        icon: Info,
        iconColor: 'text-primary',
        iconBg: 'bg-primary/10 border-primary/30',
        confirmBtn:
            'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_12px_rgba(0,238,255,0.3)]',
        glow: 'shadow-[0_0_40px_rgba(0,238,255,0.15)]',
        border: 'border-primary/30',
    },
} as const;

export function ConfirmPopup({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    isLoading = false,
}: ConfirmPopupProps) {
    usePreventScroll(isOpen);

    if (!isOpen) return null;

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative bg-background/95 w-full max-w-md rounded-xl border backdrop-blur-xl',
                    'flex flex-col overflow-hidden',
                    'animate-in fade-in zoom-in-95 duration-300',
                    config.glow,
                    config.border,
                )}
            >
                {/* Decorative corners */}
                <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" />

                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-0">
                    <div
                        className={cn(
                            'size-11 rounded-lg border flex items-center justify-center shrink-0',
                            config.iconBg,
                        )}
                    >
                        <Icon className={cn('size-5', config.iconColor)} />
                    </div>
                    {!isLoading && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                    <h3 className="text-base font-bold text-foreground tracking-tight mb-1.5">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-muted/30 border-t border-primary/10 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',
                            config.confirmBtn,
                        )}
                    >
                        {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
