'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, ImagePlus, Loader2, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import type { BrickDetail } from '@/types/brick.types';
import { cn } from '@/utils/classnames';
import { useDeleteBrickThumbnail, useAddBrickThumbnails } from '@/hooks/apis/brick.api';
import { useToast } from '@/hooks/useToast';
import { ConfirmPopup } from '@/components/shared';

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

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
const MAX_THUMBNAILS = 5;

interface BrickMediaViewerProps {
    brick: BrickDetail;
    isOwner?: boolean;
}

export function BrickMediaViewer({ brick, isOwner = false }: BrickMediaViewerProps) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [show3D, setShow3D] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeThumbIndex, setActiveThumbIndex] = useState(0);

    const deleteThumbnailMutation = useDeleteBrickThumbnail();
    const addThumbnailsMutation = useAddBrickThumbnails();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const isGltf = brick.mediaType === 'GLTF';
    const thumbnails = Array.isArray(brick.thumbnail) ? brick.thumbnail : [];
    const glbUrl = brick.media?.url;

    // For ART / REALTIME: owner sees original media, others see watermark
    const shouldUseWatermark =
        !isOwner &&
        (brick.tagType === 'ART' || brick.tagType === 'REALTIME') &&
        brick.watermark?.url;

    const imageUrl =
        thumbnails[activeThumbIndex]?.url ||
        (shouldUseWatermark ? brick.watermark?.url : brick.media?.url) ||
        brick.media?.url ||
        '';

    const handleRefresh = () => {
        setIsRefreshing(true);
        setModelLoaded(false);
        setRefreshKey((k) => k + 1);
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleToggle3D = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (show3D) {
            setShow3D(false);
            setModelLoaded(false);
        } else {
            setShow3D(true);
        }
    };

    const requestDeleteThumbnail = (publicId: string) => {
        if (thumbnails.length <= 1) {
            toast.error('Cannot delete the last thumbnail');
            return;
        }
        setDeleteConfirmId(publicId);
    };

    const confirmDeleteThumbnail = () => {
        if (!deleteConfirmId) return;
        deleteThumbnailMutation.mutate(
            { brickId: brick.id, publicId: deleteConfirmId },
            {
                onSuccess: () => {
                    toast.success('Thumbnail deleted');
                    setDeleteConfirmId(null);
                    // Adjust active index if needed
                    if (activeThumbIndex >= thumbnails.length - 1) {
                        setActiveThumbIndex(Math.max(0, thumbnails.length - 2));
                    }
                },
                onError: () => {
                    toast.error('Failed to delete thumbnail');
                    setDeleteConfirmId(null);
                },
            },
        );
    };

    const handleAddThumbnails = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = MAX_THUMBNAILS - thumbnails.length;
        if (remaining <= 0) {
            toast.error(`Maximum ${MAX_THUMBNAILS} thumbnails allowed`);
            return;
        }

        const selected = Array.from(files).slice(0, remaining);
        if (files.length > remaining) {
            toast.error(`Only ${remaining} more thumbnail(s) can be added`);
        }

        addThumbnailsMutation.mutate(
            { brickId: brick.id, files: selected },
            {
                onSuccess: () => toast.success('Thumbnail(s) added'),
                onError: () => toast.error('Failed to add thumbnail(s)'),
            },
        );

        // Reset input so the same files can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            {/* Main viewer area */}
            <div className="relative w-full bg-black/20 rounded-lg overflow-hidden border border-primary/20">
                {show3D && isGltf && glbUrl ? (
                    <div className="relative" style={{ minHeight: 350 }}>
                        {isRefreshing ? (
                            <div className="w-full h-87.5 flex items-center justify-center bg-muted/40">
                                <Loader2 className="size-6 animate-spin text-primary/40" />
                            </div>
                        ) : (
                            <ModelViewer
                                key={refreshKey}
                                url={glbUrl}
                                format="glb"
                                width="100%"
                                height={350}
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

                        {/* 3D controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefresh();
                                }}
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
                        </div>

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
                    <div className="relative w-full" style={{ minHeight: 350 }}>
                        {imageUrl ? (
                            <div className="relative w-full aspect-square max-h-125">
                                <Image
                                    src={imageUrl}
                                    alt={
                                        brick.generatedDescription ||
                                        brick.description ||
                                        brick.title
                                    }
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="w-full h-87.5 flex flex-col items-center justify-center gap-2">
                                <Box className="size-12 text-muted-foreground/20" />
                                <span className="text-xs text-muted-foreground/40 font-mono">
                                    NO PREVIEW
                                </span>
                            </div>
                        )}

                        {/* View 3D overlay for GLTF */}
                        {isGltf && glbUrl && (
                            <button
                                type="button"
                                onClick={handleToggle3D}
                                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors cursor-pointer group/overlay"
                            >
                                <div className="opacity-0 group-hover/overlay:opacity-100 transition-opacity flex flex-col items-center gap-1">
                                    <Box className="size-10 text-secondary" />
                                    <span className="text-sm font-bold text-secondary tracking-widest uppercase">
                                        View 3D
                                    </span>
                                </div>
                            </button>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                            {isGltf && (
                                <div className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                    3D
                                </div>
                            )}
                            <div className="bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                {brick.tagType}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail strip for GLTF */}
            {isGltf && !show3D && (thumbnails.length > 1 || isOwner) && (
                <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none items-center">
                    {thumbnails.map((thumb, i) => (
                        <div key={thumb.publicId} className="relative shrink-0 group/thumb">
                            <button
                                type="button"
                                onClick={() => setActiveThumbIndex(i)}
                                className={cn(
                                    'relative size-12 rounded-sm overflow-hidden border transition-all cursor-pointer',
                                    i === activeThumbIndex
                                        ? 'border-secondary ring-1 ring-secondary/50'
                                        : 'border-border hover:border-primary/50',
                                )}
                            >
                                <Image
                                    src={thumb.url}
                                    alt={`${brick.title} - thumbnail ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </button>

                            {/* Delete thumbnail button (owner only, if more than 1) */}
                            {isOwner && thumbnails.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => requestDeleteThumbnail(thumb.publicId)}
                                    disabled={deleteThumbnailMutation.isPending}
                                    className="absolute -top-1.5 -right-1.5 z-10 size-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer hover:brightness-110 disabled:opacity-50"
                                    title="Delete thumbnail"
                                >
                                    {deleteThumbnailMutation.isPending ? (
                                        <Loader2 className="size-2.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-2.5" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add thumbnail button (owner only, if under max) */}
                    {isOwner && thumbnails.length < MAX_THUMBNAILS && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_IMAGE_TYPES}
                                multiple
                                onChange={handleAddThumbnails}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={addThumbnailsMutation.isPending}
                                className="shrink-0 size-12 rounded-sm border border-dashed border-primary/30 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/60 transition-all cursor-pointer disabled:opacity-50"
                                title={`Add thumbnail (${MAX_THUMBNAILS - thumbnails.length} remaining)`}
                            >
                                {addThumbnailsMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ImagePlus className="size-4" />
                                )}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Delete thumbnail confirm popup */}
            <ConfirmPopup
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDeleteThumbnail}
                title="Delete Thumbnail"
                message="Are you sure you want to delete this thumbnail? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={deleteThumbnailMutation.isPending}
            />
        </div>
    );
}
