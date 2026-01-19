'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { RotateCcw } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';
import { Footer } from '@/components/landing';

// Dynamic import for Waves to avoid SSR issues
const Waves = dynamic(() => import('@/components/react-bits-bg/Waves'), {
    ssr: false,
});

export default function NotFound() {
    return (
        <div className="bg-background min-h-screen flex flex-col overflow-hidden relative">
            {/* Waves Background */}
            <div className="fixed inset-0 z-0">
                <Waves
                    lineColor="#00eeff"
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    waveSpeedX={0.0125}
                    waveSpeedY={0.01}
                    waveAmpX={40}
                    waveAmpY={20}
                    friction={0.9}
                    tension={0.01}
                    maxCursorMove={120}
                    xGap={12}
                    yGap={36}
                />
            </div>

            {/* Scanline Effect */}
            <div
                className="fixed inset-0 pointer-events-none z-50 opacity-30"
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(0, 238, 255, 0) 50%, rgba(0, 238, 255, 0.02) 50%)',
                    backgroundSize: '100% 4px',
                }}
            />

            {/* Grid Background */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Layout Container */}
            <div className="relative z-20 flex h-full grow flex-col">
                {/* Header */}
                <header className="flex items-center justify-between whitespace-nowrap px-6 py-4 md:px-10">
                    <BrixBrandLogo href="/" size="sm" animated />
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    {/* Terminal Corner - Top Left */}
                    <div className="absolute top-12 left-12 hidden lg:block border border-primary/30 p-4 font-mono text-[10px] text-primary/80 max-w-[240px] bg-background/80 backdrop-blur-md shadow-lg">
                        <p>&gt; RECOVERY_PROTOCOL: FAILED</p>
                        <p>&gt; SECTOR_SCAN: 0x88492... ERROR</p>
                        <p>&gt; PACKET_LOSS: 98.4%</p>
                        <p>&gt; RE-ESTABLISHING UPLINK...</p>
                        <div className="mt-2 w-full h-1 bg-muted overflow-hidden">
                            <div className="h-full bg-primary w-1/3" />
                        </div>
                    </div>

                    {/* Terminal Corner - Bottom Right */}
                    <div className="absolute bottom-12 right-12 hidden lg:block border border-secondary/30 p-4 font-mono text-[10px] text-secondary/80 max-w-[240px] bg-background/80 backdrop-blur-md shadow-lg">
                        <p>&gt; MEMORY_CORRUPTION_DETECTED</p>
                        <p>&gt; STACK_TRACE: 0xAF00...0xFFFF</p>
                        <p>&gt; DATA_STREAM: INTERRUPTED</p>
                        <p>&gt; SYSTEM_HALT: UNEXPECTED</p>
                        <div className="mt-2 flex gap-1">
                            <div className="size-1 bg-secondary" />
                            <div className="size-1 bg-secondary/40" />
                            <div className="size-1 bg-secondary/20" />
                        </div>
                    </div>

                    {/* Central Content */}
                    <div className="relative z-30 text-center space-y-2 bg-background/60 p-8 rounded-xl backdrop-blur-md">
                        {/* 404 Headline with Glitch Effect */}
                        <div className="relative group">
                            <h1
                                className="text-foreground tracking-tighter text-[120px] md:text-[180px] font-bold leading-none"
                                style={{
                                    textShadow:
                                        '0.05em 0 0 #00eeff, -0.05em -0.025em 0 #BC00FF, 0.025em 0.05em 0 #00eeff',
                                    filter: 'drop-shadow(0 0 10px rgba(0, 238, 255, 0.3))',
                                }}
                            >
                                404
                            </h1>
                            {/* Ghost offset for glitch effect */}
                            <span className="absolute top-0 left-0 w-full h-full text-[120px] md:text-[180px] font-bold text-secondary opacity-20 -translate-x-1 -translate-y-1 pointer-events-none select-none">
                                404
                            </span>
                        </div>

                        {/* Subtitle */}
                        <h2 className="text-primary text-2xl md:text-3xl font-bold tracking-[0.2em] pt-4 uppercase">
                            Reality Not Found
                        </h2>

                        {/* Error Description */}
                        <div className="pt-4 space-y-1">
                            <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                                ERROR_CODE: DATA_NOT_FOUND // LOCATION_UNSTABLE
                            </p>
                            <p className="text-muted-foreground/60 font-mono text-xs italic">
                                The requested matrix node has been de-compiled.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="pt-12 flex justify-center">
                            <Link
                                href="/"
                                className="group relative px-10 py-4 bg-transparent border-2 border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_20px_rgba(0,238,255,0.2)] hover:shadow-[0_0_40px_rgba(0,238,255,0.4)]"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <RotateCcw className="size-5" />
                                    Return to Source
                                </span>
                                {/* Decorative corners */}
                                <div className="absolute -top-1 -left-1 size-2 bg-background border-r border-b border-primary" />
                                <div className="absolute -bottom-1 -right-1 size-2 bg-background border-l border-t border-primary" />
                            </Link>
                        </div>
                    </div>

                    {/* NotFound Image */}
                    <div className="mt-20 w-full max-w-[800px] px-4 group">
                        <div className="relative overflow-hidden border-2 border-primary/30 aspect-21/9 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-[0_0_30px_rgba(0,238,255,0.2)] bg-background/40 backdrop-blur-sm">
                            <Image
                                src="/images/NotFound.png"
                                alt="Data corruption pattern"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                            {/* Scanner line animation */}
                            <div
                                className="absolute inset-x-0 h-1 bg-primary/10 animate-[scan_4s_linear_infinite]"
                                style={{ top: 0 }}
                            />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>

            {/* Scanner animation keyframes */}
            <style jsx>{`
                @keyframes scan {
                    from {
                        top: 0;
                    }
                    to {
                        top: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
