'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { formatCoord, formatTimestamp } from '@/utils/brick';
import { getDefaultAvatar } from '@/utils/cloudinary';
import type { UserBrick, BrickDetailUser } from '@/types/brick.types';

export interface NewsfeedBrick extends UserBrick {
    user: BrickDetailUser;
}

interface NewsfeedBrickCardProps {
    brick: NewsfeedBrick;
    className?: string;
    onClick?: (brick: NewsfeedBrick) => void;
}

export function NewsfeedBrickCard({ brick, className, onClick }: NewsfeedBrickCardProps) {
    const imageUrl = brick.watermark?.url || brick.media?.url;
    const hasImage = !!imageUrl;
    const hasContent = hasImage || brick.title || brick.description;

    const timestamp = useMemo(() => {
        return formatTimestamp(brick.createdAt);
    }, [brick.createdAt]);

    const avatarUrl = brick.user?.avatar?.url || getDefaultAvatar(brick.user?.gender || 'OTHER');
    const username = brick.user?.username;

    return (
        <div
            className={cn(
                'bg-muted border border-border flex flex-col overflow-hidden',
                'cursor-pointer group hover:-translate-y-1 transition-transform duration-300',
                className,
            )}
            onClick={() => onClick?.(brick)}
        >
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-secondary animate-pulse" />
                    {brick.tagType} BRIX
                </h2>
                <span className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">
                    ID: {brick.id.slice(0, 8)}
                </span>
            </div>

            {/* Card Preview Area */}
            <div className="flex-1 p-3 flex items-start justify-center">
                <div
                    className={cn(
                        'w-full max-w-sm bg-background/95 border rounded-lg overflow-hidden backdrop-blur-xl transition-all duration-500',
                        hasContent
                            ? 'border-primary/40 shadow-[0_0_30px_rgba(0,238,255,0.15)] group-hover:shadow-[0_0_50px_rgba(0,238,255,0.25)]'
                            : 'border-border/30 border-dashed opacity-60',
                    )}
                >
                    {/* Image Section */}
                    <div className="p-1">
                        <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                            {hasImage ? (
                                <>
                                    <Image
                                        src={imageUrl}
                                        alt={
                                            brick.generatedDescription ||
                                            brick.description ||
                                            brick.title ||
                                            'Preview'
                                        }
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                        unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm">
                                        {brick.tagType}
                                    </div>
                                    {brick.metadata?.modelData?.nonce && (
                                        <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold font-mono rounded-full shadow-sm">
                                            {brick.metadata.modelData.nonce as string}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="size-16 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center rounded">
                                        <ImageIcon className="size-8 text-muted-foreground/20" />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                                        NO IMAGE
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-3 space-y-3">
                        {/* Title & Timestamp */}
                        <div>
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase truncate flex-1 leading-tight">
                                    {brick.title || (
                                        <span className="text-muted-foreground/30 italic font-normal normal-case">
                                            Untitled Brick
                                        </span>
                                    )}
                                </h3>
                                <span className="text-[10px] text-primary/60 font-mono shrink-0">
                                    {timestamp}
                                </span>
                            </div>
                            {brick.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {brick.description}
                                </p>
                            )}
                        </div>

                        {/* Coordinates Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                                    Latitude
                                </p>
                                <p className="text-[10px] font-mono text-foreground truncate">
                                    {formatCoord(brick.latitude, 'N', 'S')}
                                </p>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                                    Longitude
                                </p>
                                <p className="text-[10px] font-mono text-foreground truncate">
                                    {formatCoord(brick.longitude, 'E', 'W')}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        {brick.address && brick.address !== 'string' && (
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                                    Location
                                </p>
                                <p className="text-[10px] font-mono text-foreground truncate">
                                    {brick.address}
                                </p>
                            </div>
                        )}

                        {/* Artist Info */}
                        <div className="flex items-center gap-2.5 pt-2 border-t border-primary/10">
                            <Image
                                src={avatarUrl}
                                alt={username || 'User'}
                                width={24}
                                height={24}
                                className="size-6 rounded-full object-cover border border-primary/30"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold tracking-tight text-foreground truncate">
                                    {brick.user?.fullName || username || (
                                        <span className="text-muted-foreground/30">Anonymous</span>
                                    )}
                                </p>
                                <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest truncate">
                                    @{username || 'unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
