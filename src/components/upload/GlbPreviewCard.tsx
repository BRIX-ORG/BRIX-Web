'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Box, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@/components/ui';
import { cn } from '@/utils/classnames';
import { useTranslations } from 'next-intl';

const ModelViewer = dynamic(() => import('@/components/react-bits/ModelViewer'), {
    ssr: false,
    loading: () => (
        <div className="w-full aspect-square flex items-center justify-center bg-muted/40 border border-border">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin text-primary/40" />
                <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest uppercase">
                    LOADING_3D_ENGINE
                </span>
            </div>
        </div>
    ),
});

interface GlbPreviewCardProps {
    glbUrl: string | null;
    modelLoaded: boolean;
    onModelLoaded: () => void;
    thumbnails: { file: File; url: string }[];
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
    if (value == null) return '\u2014';
    const abs = Math.abs(value).toFixed(4);
    return `${abs}\u00B0 ${value >= 0 ? pos : neg}`;
}

export function GlbPreviewCard({
    glbUrl,
    modelLoaded,
    onModelLoaded,
    thumbnails,
    title,
    description,
    address,
    latitude,
    longitude,
    username,
    avatarUrl,
    className,
}: GlbPreviewCardProps) {
    const t = useTranslations('uploads.preview');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setRefreshKey((k) => k + 1);
        // Brief visual feedback before remount
        setTimeout(() => setIsRefreshing(false), 300);
    }, []);

    const hasCoords = latitude != null && longitude != null && latitude !== 0 && longitude !== 0;

    const timestamp = useMemo(
        () => new Date().toISOString().split('T')[1].split('.')[0] + ' UTC',
        [],
    );

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
            className={cn(
                'bg-background border border-border flex flex-col overflow-hidden sticky top-8',
                className,
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-secondary animate-pulse" />
                    {t('livePreview')}
                </h2>
                <span className="text-[9px] font-mono text-secondary/50 uppercase tracking-widest">
                    BRIX_3D
                </span>
            </div>

            {/* 3D Model Viewer */}
            <div className="border-b border-border">
                {glbUrl ? (
                    <div className="relative">
                        {isRefreshing ? (
                            <div
                                className="w-full flex items-center justify-center bg-muted/40 border border-border"
                                style={{ height: 320 }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="size-8 animate-spin text-primary/40" />
                                    <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest uppercase">
                                        Reloading 3D Engine...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <ModelViewer
                                key={refreshKey}
                                url={glbUrl}
                                format="glb"
                                width="100%"
                                height={320}
                                showScreenshotButton
                                environmentPreset="studio"
                                autoFrame
                                fadeIn
                                autoRotate
                                autoRotateSpeed={0.5}
                                enableManualRotation
                                enableManualZoom
                                enableMouseParallax={false}
                                enableHoverRotation={false}
                                onModelLoaded={onModelLoaded}
                            />
                        )}
                        {/* GLB badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                title="Refresh 3D model"
                                className="bg-secondary/80 hover:bg-secondary text-secondary-foreground p-1.5 rounded-full transition-colors cursor-pointer"
                            >
                                <RefreshCw
                                    className={cn('size-3', isRefreshing && 'animate-spin')}
                                />
                            </button>
                            <div className="bg-secondary/80 text-secondary-foreground px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                                3D
                            </div>
                        </div>
                        {/* Rotation hint */}
                        {modelLoaded && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full z-10">
                                <RotateCcw className="size-3 text-muted-foreground" />
                                <span className="text-[9px] font-mono text-muted-foreground">
                                    Drag to rotate
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-secondary/5">
                        <div className="size-16 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                            <Box className="size-8 text-muted-foreground/20" />
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                            No Model Loaded
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            {thumbnails.length > 0 && (
                <div className="p-3 border-b border-border">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {thumbnails.map((thumb, i) => (
                            <div
                                key={i}
                                className="relative shrink-0 size-14 rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-all"
                            >
                                <Image
                                    src={thumb.url}
                                    alt={`Thumb ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata Preview */}
            <div className="p-4 space-y-3">
                {/* Hash */}
                <p className="text-[10px] font-mono text-primary/60 truncate">HASH: {fakeHash}</p>

                {/* Title & Timestamp */}
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold tracking-tight text-foreground uppercase truncate flex-1 mr-2">
                            {title || (
                                <span className="text-muted-foreground/30 italic font-normal normal-case">
                                    Untitled Model
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
                                No description provided.
                            </span>
                        )}
                    </p>
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                        <p className="text-[9px] text-primary/60 uppercase font-bold">Latitude</p>
                        <p className="text-xs font-mono text-foreground">
                            {formatCoord(latitude, 'N', 'S')}
                        </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                        <p className="text-[9px] text-primary/60 uppercase font-bold">Longitude</p>
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
                        <p className="text-xs font-mono text-foreground truncate">{address}</p>
                    </div>
                )}

                {/* Artist Info */}
                <div className="flex items-center gap-2.5 pt-2 border-t border-primary/10">
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
                            {username || <span className="text-muted-foreground/30">username</span>}
                        </p>
                        <p className="text-[9px] text-secondary/60 font-bold uppercase tracking-widest">
                            3D Creator
                        </p>
                    </div>
                </div>
            </div>

            {/* Mini Map */}
            {hasCoords && (
                <div className="px-4 pb-4">
                    <div className="border border-border rounded-sm overflow-hidden">
                        <div className="relative h-32 w-full">
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
                                            <div className="size-4 rounded-full bg-secondary border-2 border-background shadow-[0_0_10px_rgba(0,238,255,0.6)]" />
                                            <div className="absolute inset-0 size-4 rounded-full bg-secondary/40 animate-ping" />
                                        </div>
                                    </MarkerContent>
                                </MapMarker>
                            </Map>
                        </div>
                        <div className="bg-muted px-3 py-1.5 flex items-center justify-between border-t border-border">
                            <span className="text-[9px] font-mono text-secondary/60 uppercase tracking-widest">
                                GEO_LOCK
                            </span>
                            <span className="text-[9px] font-mono text-foreground/80">
                                {latitude!.toFixed(4)}, {longitude!.toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-muted border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        PREVIEW_STATUS
                    </span>
                    <span
                        className={cn(
                            'text-[10px] font-bold',
                            glbUrl ? 'text-secondary' : 'text-muted-foreground/40',
                        )}
                    >
                        {glbUrl
                            ? modelLoaded
                                ? 'MODEL_LOADED'
                                : 'LOADING_MODEL'
                            : 'AWAITING_DATA'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">TAG_TYPE</span>
                    <span className="text-[10px] font-bold text-secondary">GLB_BRICK</span>
                </div>
            </div>
        </div>
    );
}
