import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import { gsap } from 'gsap';

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
    // SSR safe: return defaultValue during SSR
    const get = () => {
        if (typeof window === 'undefined') return defaultValue;
        return values[queries.findIndex((q) => window.matchMedia(q).matches)] ?? defaultValue;
    };

    const [value, setValue] = useState<number>(defaultValue);

    useEffect(() => {
        // Set initial value on client
        setValue(get());

        const handler = () => setValue(get());
        queries.forEach((q) => window.matchMedia(q).addEventListener('change', handler));
        return () =>
            queries.forEach((q) => window.matchMedia(q).removeEventListener('change', handler));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queries]);

    return value;
};

const useMeasure = <T extends HTMLElement>() => {
    const ref = useRef<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
    await Promise.all(
        urls.map(
            (src) =>
                new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = img.onerror = () => resolve();
                }),
        ),
    );
};

export interface MasonryItem {
    id: string;
    img: string;
    url: string;
    height: number;
    title: string;
    description: string;
    hash: string;
    lat: string;
    lng: string;
    timestamp?: string;
}

interface GridItem extends MasonryItem {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface MasonryProps {
    items: MasonryItem[];
    ease?: string;
    duration?: number;
    stagger?: number;
    animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
    scaleOnHover?: boolean;
    hoverScale?: number;
    blurToFocus?: boolean;
    colorShiftOnHover?: boolean;
    onItemClick?: (item: MasonryItem) => void;
}

const Masonry: React.FC<MasonryProps> = ({
    items,
    ease = 'power3.out',
    duration = 0.6,
    stagger = 0.05,
    animateFrom = 'bottom',
    scaleOnHover = true,
    hoverScale = 0.95,
    blurToFocus = true,
    colorShiftOnHover = false,
    onItemClick,
}) => {
    const columns = useMedia(
        ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
        [5, 4, 3, 2],
        1,
    );

    const [containerRef, { width }] = useMeasure<HTMLDivElement>();
    const [imagesReady, setImagesReady] = useState(false);

    const getInitialPosition = (item: GridItem) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return { x: item.x, y: item.y };

        let direction = animateFrom;
        if (animateFrom === 'random') {
            const dirs = ['top', 'bottom', 'left', 'right'];
            direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
        }

        switch (direction) {
            case 'top':
                return { x: item.x, y: -200 };
            case 'bottom':
                return { x: item.x, y: window.innerHeight + 200 };
            case 'left':
                return { x: -200, y: item.y };
            case 'right':
                return { x: window.innerWidth + 200, y: item.y };
            case 'center':
                return {
                    x: containerRect.width / 2 - item.w / 2,
                    y: containerRect.height / 2 - item.h / 2,
                };
            default:
                return { x: item.x, y: item.y + 100 };
        }
    };

    useEffect(() => {
        preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
    }, [items]);

    const grid = useMemo<GridItem[]>(() => {
        if (!width) return [];
        const colHeights = new Array(columns).fill(0);
        const gap = 16;
        const totalGaps = (columns - 1) * gap;
        const columnWidth = (width - totalGaps) / columns;

        return items.map((child) => {
            const col = colHeights.indexOf(Math.min(...colHeights));
            const x = col * (columnWidth + gap);
            const height = child.height / 2;
            const y = colHeights[col];

            colHeights[col] += height + gap;
            return { ...child, x, y, w: columnWidth, h: height };
        });
    }, [columns, items, width]);

    const hasMounted = useRef(false);

    useLayoutEffect(() => {
        if (!imagesReady) return;

        grid.forEach((item, index) => {
            const selector = `[data-key="${item.id}"]`;
            const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

            if (!hasMounted.current) {
                const start = getInitialPosition(item);
                gsap.fromTo(
                    selector,
                    {
                        opacity: 0,
                        x: start.x,
                        y: start.y,
                        width: item.w,
                        height: item.h,
                        ...(blurToFocus && { filter: 'blur(10px)' }),
                    },
                    {
                        opacity: 1,
                        ...animProps,
                        ...(blurToFocus && { filter: 'blur(0px)' }),
                        duration: 0.8,
                        ease: 'power3.out',
                        delay: index * stagger,
                    },
                );
            } else {
                gsap.to(selector, {
                    ...animProps,
                    duration,
                    ease,
                    overwrite: 'auto',
                });
            }
        });

        hasMounted.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

    const handleMouseEnter = (id: string, element: HTMLElement) => {
        if (scaleOnHover) {
            gsap.to(`[data-key="${id}"]`, {
                scale: hoverScale,
                duration: 0.3,
                ease: 'power2.out',
            });
        }
        if (colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay') as HTMLElement;
            if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
        }
    };

    const handleMouseLeave = (id: string, element: HTMLElement) => {
        if (scaleOnHover) {
            gsap.to(`[data-key="${id}"]`, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        }
        if (colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay') as HTMLElement;
            if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
        }
    };

    const handleClick = (item: MasonryItem) => {
        if (onItemClick) {
            onItemClick(item);
        } else {
            window.open(item.url, '_blank', 'noopener');
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {grid.map((item) => (
                <div
                    key={item.id}
                    data-key={item.id}
                    className="absolute box-content cursor-pointer group"
                    style={{ willChange: 'transform, width, height, opacity' }}
                    onClick={() => handleClick(item)}
                    onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
                    onMouseLeave={(e) => handleMouseLeave(item.id, e.currentTarget)}
                >
                    {/* Card Container - fits content */}
                    <div className="w-full bg-background/95 border border-primary/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,238,255,0.15)]">
                        {/* Image Section - same as BrixDetailPopup */}
                        <div className="p-1 shrink-0">
                            <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                                <NextImage
                                    src={item.img}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 20vw"
                                />
                                <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                    AUTHENTIC
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                                    <p className="text-[10px] font-mono text-primary truncate">
                                        HASH: {item.hash}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Section - same as BrixDetailPopup */}
                        <div className="p-3 space-y-2 flex-1 overflow-hidden">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xs font-bold tracking-tight text-foreground uppercase truncate flex-1">
                                        {item.title}
                                    </h3>
                                    {item.timestamp && (
                                        <span className="text-[9px] text-primary/60 font-mono ml-2 shrink-0">
                                            {item.timestamp}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>
                            </div>

                            {/* Coordinates Grid - same as BrixDetailPopup */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                                    <p className="text-[8px] text-primary/60 uppercase font-bold">
                                        Latitude
                                    </p>
                                    <p className="text-[9px] font-mono text-foreground truncate">
                                        {item.lat}
                                    </p>
                                </div>
                                <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                                    <p className="text-[8px] text-primary/60 uppercase font-bold">
                                        Longitude
                                    </p>
                                    <p className="text-[9px] font-mono text-foreground truncate">
                                        {item.lng}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Color Shift Overlay */}
                        {colorShiftOnHover && (
                            <div className="color-overlay absolute inset-0 bg-linear-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none rounded-lg" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Masonry;
