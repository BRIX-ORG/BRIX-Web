'use client';

import Image from 'next/image';
import { BadgeCheck, Shield, UserPlus, Terminal } from 'lucide-react';

export interface ArtistData {
    id: string;
    username: string;
    tagline: string;
    avatar: string;
    trustScore: number;
    verifiedAt: string | null;
}

interface ArtistHeroSectionProps {
    artist: ArtistData;
    onFollow?: () => void;
    onConnect?: () => void;
}

export function ArtistHeroSection({ artist, onFollow, onConnect }: ArtistHeroSectionProps) {
    return (
        <section className="relative group">
            <div className="h-75 w-full bg-muted rounded-xl overflow-hidden relative border border-primary/10">
                {/* Cyber grid background */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(0,238,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />

                {/* Profile Info */}
                <div className="absolute bottom-6 left-8 flex items-end gap-8">
                    <div className="relative">
                        <div className="size-32 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(0,238,255,0.4)] overflow-hidden bg-muted">
                            <Image
                                src={artist.avatar}
                                alt={artist.username}
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {artist.verifiedAt && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 border-4 border-background">
                                <BadgeCheck className="size-4" />
                            </div>
                        )}
                    </div>
                    <div className="pb-2 space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {artist.username}
                        </h1>
                        <p className="text-primary/80 font-mono text-sm uppercase tracking-widest">
                            {artist.tagline}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                                <Shield className="size-4 text-primary" />
                                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-tighter">
                                    Trust Score: {artist.trustScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-6 right-8 flex gap-3">
                    <button
                        onClick={onFollow}
                        className="flex items-center gap-2 px-6 py-3 bg-muted border border-secondary/50 text-foreground rounded-sm font-bold uppercase text-xs hover:bg-secondary/20 transition-all"
                    >
                        <UserPlus className="size-4" /> Follow
                    </button>
                    <button
                        onClick={onConnect}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-secondary to-primary text-primary-foreground rounded-sm font-bold uppercase text-xs hover:opacity-90 transition-all"
                    >
                        <Terminal className="size-4" /> Connect
                    </button>
                </div>
            </div>
        </section>
    );
}
