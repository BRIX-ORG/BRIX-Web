'use client';

import { Database, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { formatTimestamp } from '@/utils/brick';
import type { UserBrick } from '@/types/brick.types';
import ElectricBorder from '@/components/react-bits/ElectricBorder';

interface ArchiveBrickCardProps {
    brick: UserBrick;
    onClick: (brick: UserBrick) => void;
}

export function ArchiveBrickCard({ brick, onClick }: ArchiveBrickCardProps) {
    const imageUrl = brick.watermark?.url || brick.media?.url;
    const timestamp = formatTimestamp(brick.createdAt);
    const isVerified = brick.tagType === 'REALTIME' && !!brick.metadata?.verifiedAt;

    return (
        <ElectricBorder
            color="#7df9ff"
            speed={0.8}
            chaos={0.1}
            borderRadius={16}
            className="group cursor-pointer"
        >
            <div
                onClick={() => onClick(brick)}
                className="relative bg-background/60 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-2xl"
            >
                {/* Image/Preview Area */}
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={brick.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                            <Database className="size-10 text-primary/10" />
                        </div>
                    )}

                    {/* Sophisticated Gradient Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Tag Badges - Floating Style */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                        <span
                            className={cn(
                                'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border backdrop-blur-md shadow-lg transition-transform group-hover:-translate-y-0.5',
                                brick.tagType === 'REALTIME'
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : brick.tagType === 'ART'
                                      ? 'bg-primary/20 border-primary/40 text-primary'
                                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400',
                            )}
                        >
                            {brick.tagType}
                        </span>
                        {isVerified && (
                            <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md shadow-lg">
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Title & Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="flex justify-between items-end gap-4">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm md:text-base font-black text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors duration-300">
                                    {brick.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="size-1.5 rounded-full bg-primary/50" />
                                    <p className="text-[10px] font-mono text-muted-foreground/90 uppercase tracking-widest leading-none">
                                        AT: {timestamp}
                                    </p>
                                </div>
                            </div>
                            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transform group-hover:scale-110 transition-all duration-500">
                                <ArrowUpRight className="size-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refined Metadata Footer */}
                <div className="px-5 py-4 bg-muted/30 border-t border-primary/5 flex justify-between items-center group-hover:bg-primary/5 transition-colors duration-500">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-muted-foreground/50 uppercase font-black tracking-[0.2em]">
                            Sequence Code
                        </span>
                        <span className="text-[11px] font-mono text-primary/80 font-bold">
                            {brick.mediaType || 'NULL'} / {brick.isPublic ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                    </div>
                    <div className="flex flex-col text-right gap-0.5">
                        <span className="text-[8px] text-muted-foreground/50 uppercase font-black tracking-[0.2em]">
                            Origin Coord
                        </span>
                        <span className="text-[11px] font-mono text-foreground/80">
                            {brick.latitude
                                ? `${brick.latitude.toFixed(3)}, ${brick.longitude?.toFixed(3)}`
                                : '0.000, 0.000'}
                        </span>
                    </div>
                </div>
            </div>
        </ElectricBorder>
    );
}
