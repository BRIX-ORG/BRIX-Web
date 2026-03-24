'use client';

import Image from 'next/image';
import { ShieldCheck, Play } from 'lucide-react';
import Link from 'next/link';
import ScrambledText from '@/components/react-bits/ScrambledText';
import { useTranslations } from 'next-intl';

export function HeroSection() {
    const t = useTranslations('landing');
    return (
        <section className="relative min-h-screen flex items-center pt-20 cyber-grid overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background pointer-events-none"></div>

            {/* Animated Blur Elements */}
            <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]"></div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Column - Content */}
                <div className="flex flex-col gap-8">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 w-fit">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                            {t('HeroSection.status')}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter uppercase">
                        {t('HeroSection.headline.part1')} <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                            {t('HeroSection.headline.highlight')}
                        </span>
                        , <br />
                        {t('HeroSection.headline.part2')}
                    </h1>

                    {/* Description */}
                    <ScrambledText
                        className="font-body text-lg text-muted-foreground max-w-lg min-h-24 leading-relaxed"
                        radius={100}
                        duration={1.2}
                        speed={0.5}
                        scrambleChars=".:"
                        text={t('HeroSection.description')}
                    />

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            href="/login"
                            className="flex items-center justify-center h-14 px-8 bg-primary text-primary-foreground font-display font-black text-sm uppercase tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-transform border-r-4 border-b-4 border-white"
                        >
                            {t('HeroSection.cta.getStarted')}
                        </Link>
                        <Link
                            href="/introduction"
                            className="h-14 px-8 border border-border text-foreground font-display font-bold text-sm uppercase tracking-widest hover:bg-muted transition-colors flex items-center gap-2"
                        >
                            <Play className="size-4" />
                            {t('HeroSection.cta.explore')}
                        </Link>
                    </div>
                </div>

                {/* Right Column - Hero Image */}
                <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary opacity-30 blur group-hover:opacity-50 transition duration-1000"></div>

                    <div className="relative bg-background border border-border p-2">
                        <div className="aspect-square relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                            <Image
                                src="/images/HeroImage.png"
                                alt="Futuristic cybernetic portrait with digital data overlay"
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Overlay UI */}
                            <div className="absolute inset-0 flex flex-col justify-between p-6 bg-black/20 pointer-events-none">
                                <div className="flex justify-between items-start">
                                    <div className="font-mono text-[10px] bg-black/60 backdrop-blur-md p-2 border border-border">
                                        <p className="text-primary">
                                            {t('HeroSection.overlay.lat')}
                                        </p>
                                        <p className="text-primary">
                                            {t('HeroSection.overlay.lng')}
                                        </p>
                                    </div>
                                    <div className="font-mono text-[10px] bg-black/60 backdrop-blur-md p-2 border border-border text-right uppercase">
                                        <p className="text-muted-foreground">
                                            {t('HeroSection.overlay.hash')}
                                        </p>
                                        <p className="text-secondary">
                                            {t('HeroSection.overlay.verified')}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full flex justify-between items-end">
                                    <div className="bg-black/60 backdrop-blur-md p-3 border border-border">
                                        <p className="font-display font-bold text-lg uppercase tracking-wider">
                                            {t('HeroSection.overlay.location')}
                                        </p>
                                        <p className="font-mono text-[10px] text-muted-foreground italic">
                                            {t('HeroSection.overlay.unix')}
                                        </p>
                                    </div>
                                    <div className="size-12 border border-primary/50 flex items-center justify-center">
                                        <div className="size-6 bg-primary animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
