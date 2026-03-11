import React from 'react';

export function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {children}
            </h3>
            {count !== undefined && (
                <span className="text-[9px] font-mono text-primary/50 bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {count}
                </span>
            )}
            <div className="flex-1 h-px bg-border/50" />
        </div>
    );
}
