'use client';

import { useRealtimeSessionStore } from '@/stores/realtime-session-store';

export function NonceOverlay() {
    const { nonce, status } = useRealtimeSessionStore();

    if (!nonce || (status !== 'active' && status !== 'capturing')) return null;

    return (
        <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
            {/* Nonce Badge */}
            <div className="border border-primary/60 bg-background/80 backdrop-blur-md px-4 py-2 glow-cyan">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5 font-bold">
                    Challenge_Nonce
                </div>
                <div className="text-2xl font-mono font-bold text-primary tracking-[0.3em] neon-glow-text animate-pulse">
                    {nonce}
                </div>
            </div>

            {/* Instruction */}
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground max-w-48 text-right">
                Nonce will be embedded into image pixels on capture
            </div>
        </div>
    );
}
