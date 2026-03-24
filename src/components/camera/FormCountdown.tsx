'use client';

import { Timer } from 'lucide-react';
import { useRealtimeSessionStore } from '@/stores/realtime-session-store';
import { useTranslations } from 'next-intl';

/**
 * Inline countdown bar shown in the upload form modal during the form-fill phase.
 * Shows how many seconds remain before the session expires.
 */
export function FormCountdown() {
    const t = useTranslations('camera.FormCountdown');
    const { countdown, status, expiresIn } = useRealtimeSessionStore();

    // Only show during capturing (form phase) — not uploading/success/etc.
    if (status !== 'capturing') return null;

    const isUrgent = countdown <= 20;
    const isCritical = countdown <= 10;

    // Progress percentage based on the form phase allocation
    // Form phase ≈ expiresIn seconds (the remaining TTL when photo was taken)
    const percentage = Math.max(0, (countdown / expiresIn) * 100);

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    const timeLabel =
        minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;

    return (
        <div className="bg-muted/60 border border-border rounded-sm px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Timer
                        className={`size-4 ${
                            isCritical
                                ? 'text-destructive animate-pulse'
                                : isUrgent
                                  ? 'text-secondary'
                                  : 'text-primary'
                        }`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t('label')}
                    </span>
                </div>
                <span
                    className={`text-sm font-mono font-bold tabular-nums ${
                        isCritical
                            ? 'text-destructive animate-pulse'
                            : isUrgent
                              ? 'text-secondary'
                              : 'text-primary'
                    }`}
                >
                    {timeLabel}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                        isCritical ? 'bg-destructive' : isUrgent ? 'bg-secondary' : 'bg-primary'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
