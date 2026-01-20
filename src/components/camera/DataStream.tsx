'use client';

import { useEffect, useRef } from 'react';

interface DataStreamProps {
    lines: string[];
    className?: string;
}

export function DataStream({ lines, className = '' }: DataStreamProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Auto-scroll effect
        let scrollPos = 0;
        const interval = setInterval(() => {
            scrollPos += 0.5;
            if (scrollPos >= container.scrollHeight - container.clientHeight) {
                scrollPos = 0;
            }
            container.scrollTop = scrollPos;
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`h-64 overflow-hidden text-[9px] opacity-40 leading-relaxed uppercase font-mono scrollbar-hide ${className}`}
        >
            {lines.map((line, i) => (
                <p key={i}>{line}</p>
            ))}
            {/* Repeat for seamless loop */}
            {lines.map((line, i) => (
                <p key={`repeat-${i}`}>{line}</p>
            ))}
        </div>
    );
}
