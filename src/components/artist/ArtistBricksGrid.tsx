'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { UserBrick } from '@/types/brick.types';
import { ModelBrickCard } from '@/components/artist';

interface ArtistBricksGridProps {
    bricks: UserBrick[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    onLoadMore: () => void;
    onBrickClick?: (brick: UserBrick) => void;
}

function BrickCardSkeleton() {
    return (
        <div className="bg-background/95 border border-primary/20 rounded-lg overflow-hidden animate-pulse">
            <div className="p-1">
                <div className="aspect-4/3 w-full bg-primary/10 rounded-sm" />
            </div>
            <div className="p-3 space-y-2">
                <div className="h-3 bg-primary/10 rounded w-3/4" />
                <div className="h-2.5 bg-primary/5 rounded w-full" />
                <div className="grid grid-cols-2 gap-1">
                    <div className="h-8 bg-primary/5 rounded" />
                    <div className="h-8 bg-primary/5 rounded" />
                </div>
            </div>
        </div>
    );
}

export function ArtistBricksGrid({
    bricks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
    onBrickClick,
}: ArtistBricksGridProps) {
    /* ── Initial loading ─────────────────────────────── */
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <BrickCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    /* ── Empty state ──────────────────────────────────── */
    if (bricks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-muted-foreground/30">∅</span>
                </div>
                <p className="text-sm text-muted-foreground/60 font-mono uppercase tracking-widest">
                    No 3D models found
                </p>
            </div>
        );
    }

    /* ── Model cards grid ─────────────────────────────── */
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {bricks.map((brick) => (
                    <ModelBrickCard key={brick.id} brick={brick} onClick={onBrickClick} />
                ))}

                {/* Skeleton placeholders while fetching next page */}
                {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, i) => (
                        <BrickCardSkeleton key={`loading-${i}`} />
                    ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
                <div className="flex justify-center pt-8">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isFetchingNextPage}
                        className={cn(
                            'group relative px-8 py-3 border text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer',
                            'border-primary/30 text-primary/70 hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(0,238,255,0.2)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {isFetchingNextPage ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="size-3.5 animate-spin" />
                                Loading...
                            </span>
                        ) : (
                            'Load More'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
