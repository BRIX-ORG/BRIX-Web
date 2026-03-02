'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@/components/ui';
import { cn } from '@/utils/classnames';

interface BrickPreviewCardProps {
    imageUrl?: string | null;
    title?: string;
    description?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    username?: string;
    avatarUrl?: string;
    className?: string;
}

function formatCoord(value: number | null | undefined, pos: string, neg: string): string {
    if (value == null) return '—';
    const abs = Math.abs(value).toFixed(4);
    return `${abs}° ${value >= 0 ? pos : neg}`;
}

export function BrickPreviewCard({
    imageUrl,
    title,
    description,
    address,
    latitude,
    longitude,
    username,
    avatarUrl,
    className,
}: BrickPreviewCardProps) {
    const hasImage = !!imageUrl;
    const hasContent = hasImage || title || description;
    const hasCoords = latitude != null && longitude != null && latitude !== 0 && longitude !== 0;

    const timestamp = useMemo(() => {
        return new Date().toISOString().split('T')[1].split('.')[0] + ' UTC';
    }, []);

    const fakeHash = useMemo(() => {
        if (!title) return '0x00000...000000';
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = (hash << 5) - hash + title.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
        return `0x${hex.slice(0, 5)}...${hex.slice(-6)}`;
    }, [title]);

    return (
        <div
            className={cn('bg-muted border border-border flex flex-col overflow-hidden', className)}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-secondary animate-pulse" />
                    Live Preview
                </h2>
                <span className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">
                    BRIX_CARD
                </span>
            </div>

            {/* Card Preview Area — styled like BrixDetailPopup */}
            <div className="flex-1 p-4 flex items-start justify-center">
                <div
                    className={cn(
                        'w-full max-w-sm bg-background/95 border rounded-lg overflow-hidden backdrop-blur-xl transition-all duration-500',
                        hasContent
                            ? 'border-primary/40 shadow-[0_0_50px_rgba(0,238,255,0.2)]'
                            : 'border-border/30 border-dashed opacity-60',
                    )}
                >
                    {/* Image Section */}
                    <div className="p-1">
                        <div className="relative aspect-square w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                            {hasImage ? (
                                <>
                                    <Image
                                        src={imageUrl}
                                        alt={title || 'Preview'}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                        ART
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                                        <p className="text-[10px] font-mono text-primary truncate">
                                            HASH: {fakeHash}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="size-16 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                        <ImageIcon className="size-8 text-muted-foreground/20" />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                                        No Image Selected
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-4 space-y-4">
                        {/* Title & Timestamp */}
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase truncate flex-1 mr-2">
                                    {title || (
                                        <span className="text-muted-foreground/30 italic font-normal normal-case">
                                            Untitled Brick
                                        </span>
                                    )}
                                </h3>
                                <span className="text-[10px] text-primary/60 font-mono shrink-0">
                                    {timestamp}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {description || (
                                    <span className="italic text-muted-foreground/30">
                                        No description provided. Add one to verify asset metadata.
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Coordinates Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold">
                                    Latitude
                                </p>
                                <p className="text-xs font-mono text-foreground">
                                    {formatCoord(latitude, 'N', 'S')}
                                </p>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold">
                                    Longitude
                                </p>
                                <p className="text-xs font-mono text-foreground">
                                    {formatCoord(longitude, 'E', 'W')}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        {address && (
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold mb-0.5">
                                    Location
                                </p>
                                <p className="text-xs font-mono text-foreground truncate">
                                    {address}
                                </p>
                            </div>
                        )}

                        {/* Artist Info */}
                        <div className="flex items-center gap-2.5 pt-1 border-t border-primary/10">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={username || 'User'}
                                    width={28}
                                    height={28}
                                    className="size-7 rounded-full object-cover border border-primary/30"
                                />
                            ) : (
                                <div className="size-7 rounded-full bg-primary/10 border border-primary/20" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold tracking-tight text-foreground truncate">
                                    {username || (
                                        <span className="text-muted-foreground/30">username</span>
                                    )}
                                </p>
                                <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest">
                                    Verified Artist
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="w-full py-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest text-center rounded border border-primary/20">
                            Full Metadata Analysis
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Map */}
            {hasCoords && (
                <div className="px-4 pb-4">
                    <div className="border border-border rounded-sm overflow-hidden">
                        <div className="relative h-40 w-full">
                            <Map
                                key={`${latitude!.toFixed(4)},${longitude!.toFixed(4)}`}
                                center={[longitude!, latitude!]}
                                zoom={13}
                                interactive={false}
                                attributionControl={false}
                            >
                                <MapMarker longitude={longitude!} latitude={latitude!}>
                                    <MarkerContent>
                                        <div className="relative">
                                            <div className="size-4 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(0,238,255,0.6)]" />
                                            <div className="absolute inset-0 size-4 rounded-full bg-primary/40 animate-ping" />
                                        </div>
                                    </MarkerContent>
                                </MapMarker>
                            </Map>
                        </div>
                        <div className="bg-black/40 px-3 py-1.5 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest">
                                GEO_LOCK
                            </span>
                            <span className="text-[9px] font-mono text-foreground/60">
                                {latitude!.toFixed(4)}, {longitude!.toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-black/40 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        PREVIEW_STATUS
                    </span>
                    <span
                        className={cn(
                            'text-[10px] font-bold',
                            hasContent ? 'text-primary' : 'text-muted-foreground/40',
                        )}
                    >
                        {hasContent ? 'RENDERING' : 'AWAITING_DATA'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">TAG_TYPE</span>
                    <span className="text-[10px] font-bold text-secondary">ART_BRICK</span>
                </div>
            </div>
        </div>
    );
}
