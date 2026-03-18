'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetBrickDetail } from '@/hooks/apis/brick.api';
import { getDefaultAvatar } from '@/utils/cloudinary';
import { formatCoord, formatTimestamp } from '@/utils/brick';

interface MapHoverCardProps {
    brickId: string;
}

export function MapHoverCard({ brickId }: MapHoverCardProps) {
    const { data: brick, isLoading } = useGetBrickDetail(brickId);

    const timestamp = useMemo(() => {
        return brick ? formatTimestamp(brick.createdAt) : '';
    }, [brick]);

    if (isLoading) {
        return (
            <div className="w-48 h-32 flex items-center justify-center bg-background border border-border rounded-lg shadow-xl backdrop-blur-xl">
                <Loader2 className="size-5 animate-spin text-primary" />
            </div>
        );
    }

    if (!brick) return null;

    const imageUrl = brick.watermark?.url || brick.media?.url;
    const avatarUrl = brick.user?.avatar?.url || getDefaultAvatar(brick.user?.gender || 'OTHER');

    return (
        <div className="w-64 overflow-hidden rounded-xl bg-background/90 border border-primary/30 shadow-[0_0_20px_rgba(0,238,255,0.1)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,238,255,0.2)] hover:border-primary/50 transition-all">
            {imageUrl ? (
                <div className="relative aspect-video w-full bg-primary/10 border-b border-primary/20">
                    <Image
                        src={imageUrl}
                        alt={brick.title || 'Preview'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 bg-primary/80 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-primary-foreground border border-primary/50 shadow-lg">
                        {brick.tagType}
                    </div>
                </div>
            ) : (
                <div className="relative aspect-video w-full bg-primary/5 border-b border-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                        NO ASSET
                    </span>
                </div>
            )}
            <div className="p-3 space-y-3">
                {/* Title & Timestamp */}
                <div>
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="text-[11px] font-black tracking-widest text-foreground uppercase truncate flex-1 leading-tight group-hover:text-primary transition-colors">
                            {brick.title || 'Untitled Node'}
                        </h3>
                        <span className="text-[9px] text-primary/60 font-mono shrink-0">
                            {timestamp}
                        </span>
                    </div>
                    {brick.description && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                            {brick.description}
                        </p>
                    )}
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                        <p className="text-[7px] text-primary/60 uppercase font-bold mb-0.5">Lat</p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.latitude, 'N', 'S')}
                        </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                        <p className="text-[7px] text-primary/60 uppercase font-bold mb-0.5">Lon</p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.longitude, 'E', 'W')}
                        </p>
                    </div>
                </div>

                {/* Address */}
                {brick.address && brick.address !== 'string' && (
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                        <p className="text-[7px] text-primary/60 uppercase font-bold mb-0.5">
                            Location
                        </p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {brick.address}
                        </p>
                    </div>
                )}

                {/* Artist Info */}
                <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                    <div className="relative size-5 rounded-full bg-muted overflow-hidden shrink-0 border border-primary/20 shadow-sm">
                        <Image
                            src={avatarUrl}
                            alt={brick.user?.username || 'User'}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-tight text-foreground truncate">
                            {brick.user?.fullName || brick.user?.username}
                        </p>
                        <p className="text-[8px] text-primary/60 font-bold uppercase tracking-widest truncate">
                            @{brick.user.username}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
