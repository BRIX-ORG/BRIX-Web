'use client';

import { Box } from 'lucide-react';

export function ModelUploadPlaceholder() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-24 px-8">
            <div className="relative mb-8">
                {/* Outer glow ring */}
                <div className="absolute inset-0 border-2 border-dashed border-secondary/20 rotate-45 scale-150" />
                <div className="size-32 border-2 border-dashed border-secondary/30 flex items-center justify-center">
                    <Box className="size-16 text-secondary/40" />
                </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tighter italic text-foreground/60 mb-3">
                MODEL_UPLOAD_MODULE
            </h2>

            <p className="text-muted-foreground text-xs tracking-[0.3em] font-medium uppercase mb-8">
                3D Model Processing Pipeline — Under Development
            </p>

            <div className="flex items-center gap-3 px-6 py-3 border border-secondary/30 bg-secondary/5">
                <span className="size-2 bg-secondary/60 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-secondary/60 uppercase">
                    Coming Soon — Phase 3
                </span>
            </div>

            {/* Decorative grid */}
            <div className="mt-16 grid grid-cols-3 gap-4 opacity-20 pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="size-20 border border-border" />
                ))}
            </div>
        </div>
    );
}
