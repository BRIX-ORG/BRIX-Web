'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { useTranslations } from 'next-intl';

export interface ThumbnailCarouselProps {
    images: { file: File; url: string }[];
    onRemove?: (index: number) => void;
    baseWidth?: number;
    autoplay?: boolean;
    autoplayDelay?: number;
    className?: string;
}

const GAP = 8;
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };
const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;

export function ThumbnailCarousel({
    images,
    onRemove,
    baseWidth = 400,
    autoplay = false,
    autoplayDelay = 4000,
    className,
}: ThumbnailCarouselProps) {
    const t = useTranslations('uploads.form');
    const containerPadding = 8;
    const itemWidth = baseWidth - containerPadding * 2;
    const trackItemOffset = itemWidth + GAP;

    const [position, setPosition] = useState(0);
    const x = useMotionValue(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Clamp position when images change
    useEffect(() => {
        if (images.length === 0) {
            setPosition(0);
        } else if (position >= images.length) {
            setPosition(Math.max(0, images.length - 1));
        }
    }, [images.length, position]);

    // Autoplay
    useEffect(() => {
        if (!autoplay || images.length <= 1) return;
        const timer = setInterval(() => {
            setPosition((prev) => (prev + 1) % images.length);
        }, autoplayDelay);
        return () => clearInterval(timer);
    }, [autoplay, autoplayDelay, images.length]);

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const { offset, velocity } = info;
            const direction =
                offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
                    ? 1
                    : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
                      ? -1
                      : 0;
            if (direction === 0) return;
            setPosition((prev) => {
                const next = prev + direction;
                return Math.max(0, Math.min(next, images.length - 1));
            });
        },
        [images.length],
    );

    const goTo = useCallback(
        (index: number) => {
            if (index >= 0 && index < images.length) {
                setPosition(index);
            }
        },
        [images.length],
    );

    const goPrev = useCallback(() => goTo(position - 1), [goTo, position]);
    const goNext = useCallback(() => goTo(position + 1), [goTo, position]);

    if (images.length === 0) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center py-12 bg-primary/5 border border-dashed border-primary/20 rounded-sm',
                    className,
                )}
            >
                <ImageIcon className="size-10 text-muted-foreground/20 mb-3" />
                <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                    {t('noThumbnails')}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-sm bg-background/50 border border-border"
                style={{ width: '100%' }}
            >
                <motion.div
                    className="flex"
                    drag={isAnimating || images.length <= 1 ? false : 'x'}
                    dragConstraints={{
                        left: -trackItemOffset * Math.max(images.length - 1, 0),
                        right: 0,
                    }}
                    style={{
                        gap: `${GAP}px`,
                        padding: `${containerPadding}px`,
                        x,
                    }}
                    onDragEnd={handleDragEnd}
                    animate={{ x: -(position * trackItemOffset) }}
                    transition={SPRING_OPTIONS}
                    onAnimationStart={() => setIsAnimating(true)}
                    onAnimationComplete={() => setIsAnimating(false)}
                >
                    {images.map((img, index) => (
                        <ThumbnailItem
                            key={`thumb-${index}-${img.file.name}`}
                            image={img}
                            index={index}
                            currentPosition={position}
                            itemWidth={itemWidth}
                            trackItemOffset={trackItemOffset}
                            x={x}
                            onRemove={onRemove}
                        />
                    ))}
                </motion.div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={position === 0}
                            className={cn(
                                'absolute left-3 top-1/2 -translate-y-1/2 z-10',
                                'size-8 rounded-full bg-background/80 backdrop-blur-sm border border-border',
                                'flex items-center justify-center transition-all',
                                position === 0
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:bg-primary/20 hover:border-primary/50 cursor-pointer',
                            )}
                        >
                            <ChevronLeft className="size-4 text-foreground" />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={position === images.length - 1}
                            className={cn(
                                'absolute right-3 top-1/2 -translate-y-1/2 z-10',
                                'size-8 rounded-full bg-background/80 backdrop-blur-sm border border-border',
                                'flex items-center justify-center transition-all',
                                position === images.length - 1
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:bg-primary/20 hover:border-primary/50 cursor-pointer',
                            )}
                        >
                            <ChevronRight className="size-4 text-foreground" />
                        </button>
                    </>
                )}

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm border border-border px-2.5 py-1 rounded-full">
                    <span className="text-[10px] font-mono font-bold text-foreground">
                        {position + 1} / {images.length}
                    </span>
                </div>
            </div>

            {/* Dot Indicators */}
            {images.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => goTo(index)}
                            className={cn(
                                'transition-all duration-300 rounded-full',
                                position === index
                                    ? 'w-6 h-1.5 bg-primary'
                                    : 'size-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 cursor-pointer',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---------- Thumbnail Item ---------- */

interface ThumbnailItemProps {
    image: { file: File; url: string };
    index: number;
    currentPosition: number;
    itemWidth: number;
    trackItemOffset: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x: any;
    onRemove?: (index: number) => void;
}

function ThumbnailItem({
    image,
    index,
    currentPosition,
    itemWidth,
    trackItemOffset,
    x,
    onRemove,
}: ThumbnailItemProps) {
    const range = useMemo(
        () => [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
        ],
        [index, trackItemOffset],
    );

    const scale = useTransform(x, range, [0.92, 1, 0.92], { clamp: false });
    const opacity = useTransform(x, range, [0.5, 1, 0.5], { clamp: false });

    return (
        <motion.div
            className="relative shrink-0 rounded-sm overflow-hidden cursor-grab active:cursor-grabbing group"
            style={{
                width: itemWidth,
                scale,
                opacity,
            }}
        >
            {/* Image */}
            <div className="relative aspect-16/10 w-full bg-muted">
                <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                />

                {/* Active indicator glow */}
                {currentPosition === index && (
                    <div className="absolute inset-0 border-2 border-primary/60 rounded-sm pointer-events-none shadow-[inset_0_0_20px_rgba(0,238,255,0.1)]" />
                )}

                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-mono text-white/80 truncate">{image.file.name}</p>
                    <p className="text-[8px] font-mono text-white/50">
                        {(image.file.size / 1024).toFixed(0)} KB
                    </p>
                </div>
            </div>

            {/* Remove button */}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                    className="absolute top-2 right-2 z-10 size-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                    <X className="size-3 text-white" />
                </button>
            )}
        </motion.div>
    );
}
