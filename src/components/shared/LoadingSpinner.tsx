'use client';

import { useUIStore } from '@/stores/ui-store';
import { usePreventScroll } from '@/hooks/usePreventScroll';

export function LoadingSpinner() {
    const isLoading = useUIStore((state) => state.isLoading);
    const loadingMessage = useUIStore((state) => state.loadingMessage);
    usePreventScroll(isLoading);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-background/90 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-6 min-w-[300px] border border-border">
                {/* Decorative corners - BRIX style */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                {/* Spinner - Cyberpunk style */}
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-2 border-muted-foreground/30 rounded-full" />
                    {/* Spinning ring */}
                    <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                    {/* Inner glow effect */}
                    <div className="absolute inset-2 border border-primary/30 rounded-full animate-pulse" />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(0,238,255,0.8)]" />
                    </div>
                </div>

                {/* Message with BRIX typography */}
                <div className="text-center space-y-1">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]">
                        SYSTEM_PROCESSING
                    </p>
                    <p className="text-sm font-medium text-foreground">
                        {loadingMessage || 'Đang xử lý...'}
                    </p>
                </div>

                {/* Animated dots */}
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
