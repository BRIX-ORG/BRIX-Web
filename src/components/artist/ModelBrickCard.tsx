'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Box, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { UserBrick } from '@/types/brick.types';
import { formatCoord, formatTimestamp, generateHash } from '@/utils/brick';

const ModelViewer = dynamic(() => import('@/components/react-bits/ModelViewer'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-muted/40">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-6 animate-spin text-primary/40" />
                <span className="text-[9px] font-mono text-muted-foreground/40 tracking-widest uppercase">
                    Loading 3D...
                </span>
            </div>
        </div>
    ),
});

interface ModelBrickCardProps {
    brick: UserBrick;
    className?: string;
    onClick?: (brick: UserBrick) => void;
}

export function ModelBrickCard({ brick, className, onClick }: ModelBrickCardProps) {
    const [show3D, setShow3D] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

    const thumbnails = brick.thumbnail || [];
    const glbUrl = brick.media?.url;
    const coverImage = thumbnails[0]?.url || brick.watermark?.url;
    const timestamp = formatTimestamp(brick.createdAt);
    const hash = generateHash(brick.title);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setModelLoaded(false);
        setRefreshKey((k) => k + 1);
        setTimeout(() => setIsRefreshing(false), 300);
    }, []);

    const handleToggle3D = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (show3D) {
            setShow3D(false);
            setModelLoaded(false);
        } else {
            setShow3D(true);
        }
    };

    return (
        <div
            className={cn(
                'bg-background/95 border border-secondary/40 rounded-lg overflow-hidden',
                'shadow-[0_0_30px_rgba(0,238,255,0.15)]',
                'break-inside-avoid mb-4 cursor-pointer',
                className,
            )}
            onClick={() => onClick?.(brick)}
        >
            {/* 3D Viewer / Thumbnail Area */}
            <div className="relative">
                {show3D && glbUrl ? (
                    <div className="relative" style={{ height: 240 }}>
                        {isRefreshing ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted/40">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="size-6 animate-spin text-primary/40" />
                                    <span className="text-[9px] font-mono text-muted-foreground/40 tracking-widest uppercase">
                                        Reloading 3D...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <ModelViewer
                                key={refreshKey}
                                url={glbUrl}
                                format="glb"
                                width="100%"
                                height={240}
                                showScreenshotButton={false}
                                environmentPreset="studio"
                                autoFrame
                                fadeIn
                                autoRotate={false}
                                enableManualRotation
                                enableManualZoom
                                enableMouseParallax={false}
                                enableHoverRotation={false}
                                onModelLoaded={() => setModelLoaded(true)}
                            />
                        )}

                        {/* 3D Mode Controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefresh();
                                }}
                                title="Refresh 3D model"
                                className="bg-secondary/80 hover:bg-secondary text-secondary-foreground p-1.5 rounded-full transition-colors cursor-pointer"
                            >
                                <RefreshCw
                                    className={cn('size-3', isRefreshing && 'animate-spin')}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={handleToggle3D}
                                className="bg-muted/80 hover:bg-muted text-foreground px-2 py-0.5 text-[10px] font-bold rounded-full cursor-pointer"
                            >
                                IMG
                            </button>
                            <div className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                GLB
                            </div>
                        </div>

                        {/* Rotation hint */}
                        {modelLoaded && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full z-10">
                                <RotateCcw className="size-3 text-muted-foreground" />
                                <span className="text-[9px] font-mono text-muted-foreground">
                                    Drag to rotate
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Thumbnail / Cover Image Mode */
                    <div className="p-1">
                        <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20 group/cover">
                            {coverImage ? (
                                <Image
                                    src={thumbnails[activeThumbnailIndex]?.url || coverImage}
                                    alt={brick.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 20vw"
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <Box className="size-8 text-muted-foreground/20" />
                                    <span className="text-[10px] text-muted-foreground/40 font-mono">
                                        NO PREVIEW
                                    </span>
                                </div>
                            )}

                            {/* View 3D overlay */}
                            {glbUrl && (
                                <button
                                    type="button"
                                    onClick={handleToggle3D}
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer"
                                >
                                    <div className="opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                                        <Box className="size-8 text-secondary" />
                                        <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                                            View 3D
                                        </span>
                                    </div>
                                </button>
                            )}

                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                <div className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                    3D
                                </div>
                                <div className="bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                    {brick.tagType}
                                </div>
                            </div>

                            {/* Hash overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                                <p className="text-[10px] font-mono text-secondary truncate">
                                    HASH: {hash}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail Strip (only in image mode when multiple thumbnails) */}
            {thumbnails.length > 1 && !show3D && (
                <div className="px-2 pb-2">
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                        {thumbnails.map((thumb, i) => (
                            <button
                                type="button"
                                key={thumb.publicId}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveThumbnailIndex(i);
                                }}
                                className={cn(
                                    'relative shrink-0 size-10 rounded-sm overflow-hidden border transition-all cursor-pointer',
                                    i === activeThumbnailIndex
                                        ? 'border-secondary ring-1 ring-secondary/50'
                                        : 'border-border hover:border-primary/50',
                                )}
                            >
                                <Image
                                    src={thumb.url}
                                    alt={`Thumb ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata Section */}
            <div className="p-3 space-y-2">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xs font-bold tracking-tight text-foreground uppercase truncate flex-1">
                            {brick.title}
                        </h3>
                        <span className="text-[9px] text-primary/60 font-mono ml-2 shrink-0">
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
                <div className="grid grid-cols-2 gap-1">
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold">Latitude</p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.latitude, 'N', 'S')}
                        </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold">Longitude</p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.longitude, 'E', 'W')}
                        </p>
                    </div>
                </div>

                {/* Address */}
                {brick.address && brick.address !== 'string' && (
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                            Location
                        </p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {brick.address}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
