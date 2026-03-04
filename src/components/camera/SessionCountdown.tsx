'use client';

import { useRealtimeSessionStore, CAPTURE_PHASE_SECONDS } from '@/stores/realtime-session-store';

/**
 * Circular countdown shown on the camera viewfinder during capture phase.
 * Displays the remaining seconds within the 30s capture window.
 */
export function SessionCountdown() {
    const { countdown, status, expiresIn } = useRealtimeSessionStore();

    if (status !== 'active') return null;

    // Capture-phase remaining = countdown − (expiresIn − CAPTURE_PHASE_SECONDS)
    // e.g. countdown=85, expiresIn=90 → captureRemaining = 85 − 60 = 25s left to capture
    const formPhaseSeconds = expiresIn - CAPTURE_PHASE_SECONDS;
    const captureRemaining = Math.max(0, countdown - formPhaseSeconds);
    const percentage = (captureRemaining / CAPTURE_PHASE_SECONDS) * 100;
    const isUrgent = captureRemaining <= 10;
    const isCritical = captureRemaining <= 5;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Circular countdown */}
            <div className="relative size-14 flex items-center justify-center">
                {/* Background circle */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                    <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-primary/20"
                    />
                    <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-linear ${
                            isCritical
                                ? 'text-destructive animate-pulse'
                                : isUrgent
                                  ? 'text-secondary'
                                  : 'text-primary'
                        }`}
                    />
                </svg>
                {/* Countdown number */}
                <span
                    className={`text-lg font-mono font-bold tabular-nums ${
                        isCritical
                            ? 'text-destructive animate-pulse'
                            : isUrgent
                              ? 'text-secondary'
                              : 'text-primary'
                    }`}
                >
                    {captureRemaining}
                </span>
            </div>

            {/* Label */}
            <span className="text-[9px] uppercase tracking-widest text-primary/50 font-bold">
                Capture in {CAPTURE_PHASE_SECONDS}s
            </span>
        </div>
    );
}
