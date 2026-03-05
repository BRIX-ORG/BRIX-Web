'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Masonry, { type MasonryItem } from '@/components/react-bits/Masonry';
import type { BrickTagType, UserBrick } from '@/types/brick.types';
import { useGetUserBricks } from '@/hooks/apis/brick.api';
import { cn } from '@/utils/classnames';
import { formatCoord, formatTimestamp } from '@/utils/brick';
import { ArtistGalleryTabs, ArtistBricksGrid, BrickDetailModal } from '@/components/artist';

interface ArtistGalleryProps {
    idOrUsername: string;
}

/** Convert a UserBrick (IMAGE type) to a MasonryItem for the Masonry component */
function brickToMasonryItem(brick: UserBrick): MasonryItem {
    const imageUrl = brick.watermark?.url || brick.media?.url || '';
    return {
        id: brick.id,
        img: imageUrl,
        url: '#',
        height: 600,
        title: brick.title,
        description: brick.description || brick.generatedDescription || '',
        lat: formatCoord(brick.latitude, 'N', 'S'),
        lng: formatCoord(brick.longitude, 'E', 'W'),
        timestamp: formatTimestamp(brick.createdAt),
        address: brick.address && brick.address !== 'string' ? brick.address : undefined,
        tag: brick.tagType,
        verifiedAt: brick.metadata?.verifiedAt ?? null,
    };
}

function LoadMoreButton({ isFetching, onClick }: { isFetching: boolean; onClick: () => void }) {
    return (
        <div className="flex justify-center pt-8">
            <button
                type="button"
                onClick={onClick}
                disabled={isFetching}
                className={cn(
                    'group relative px-8 py-3 border text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer',
                    'border-primary/30 text-primary/70 hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(0,238,255,0.2)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                {isFetching ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        Loading...
                    </span>
                ) : (
                    'Load More'
                )}
            </button>
        </div>
    );
}

function MasonrySkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-background/95 border border-primary/20 rounded-lg overflow-hidden animate-pulse"
                >
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
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-muted-foreground/30">∅</span>
            </div>
            <p className="text-sm text-muted-foreground/60 font-mono uppercase tracking-widest">
                No bricks found
            </p>
        </div>
    );
}

export function ArtistGallery({ idOrUsername }: ArtistGalleryProps) {
    const [activeTab, setActiveTab] = useState<BrickTagType>('REALTIME');
    const [selectedBrickId, setSelectedBrickId] = useState<string | undefined>(undefined);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetUserBricks(
        idOrUsername,
        activeTab,
    );

    /* Flatten all pages into a single brick list */
    const bricks = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    /* Convert to MasonryItems for REALTIME / ART tabs */
    const masonryItems = useMemo(() => bricks.map(brickToMasonryItem), [bricks]);

    const isImageTab = activeTab === 'REALTIME' || activeTab === 'ART';

    /* Handle brick click from masonry grid (uses MasonryItem.id) */
    const handleMasonryClick = useCallback((item: MasonryItem) => {
        setSelectedBrickId(item.id);
    }, []);

    /* Handle brick click from 3D model grid */
    const handleBrickClick = useCallback((brick: UserBrick) => {
        setSelectedBrickId(brick.id);
    }, []);

    const renderContent = () => {
        if (isLoading) return <MasonrySkeleton />;
        if (bricks.length === 0) return <EmptyState />;

        if (isImageTab) {
            return (
                <div>
                    <div className="h-200">
                        <Masonry
                            items={masonryItems}
                            animateFrom="bottom"
                            stagger={0.04}
                            blurToFocus
                            scaleOnHover
                            onItemClick={handleMasonryClick}
                        />
                    </div>
                    {hasNextPage && (
                        <LoadMoreButton
                            isFetching={isFetchingNextPage}
                            onClick={() => fetchNextPage()}
                        />
                    )}
                </div>
            );
        }

        /* PRODUCT tab → 3D model grid */
        return (
            <ArtistBricksGrid
                bricks={bricks}
                isLoading={false}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onBrickClick={handleBrickClick}
            />
        );
    };

    return (
        <section className="col-span-12 lg:col-span-9 space-y-6">
            <ArtistGalleryTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {renderContent()}

            {/* Brick detail modal */}
            <BrickDetailModal
                brickId={selectedBrickId}
                onClose={() => setSelectedBrickId(undefined)}
            />
        </section>
    );
}
