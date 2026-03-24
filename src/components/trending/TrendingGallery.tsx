'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    Camera,
    ImageIcon,
    Package,
    Globe,
    Sparkles,
    Users,
    Loader2,
    type LucideIcon,
} from 'lucide-react';
import { useGetNewsfeedBricks, useGetFollowingBricks } from '@/hooks/apis/brick.api';
import type { BrickTagType, UserBrick } from '@/types/brick.types';
import { NewsfeedBrickCard, type NewsfeedBrick, TimeFilter } from '@/components/trending';
import { ArtistBricksGrid } from '@/components/artist';
import { BrickDetailModal } from '@/components/brick-detail';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/classnames';

type FeedType = 'RECOMMEND' | 'FOLLOWING';
type FilterTagType = 'ALL' | BrickTagType;

const FEED_TABS: { id: FeedType; label: string; icon: LucideIcon }[] = [
    { id: 'RECOMMEND', label: 'For You', icon: Sparkles },
    { id: 'FOLLOWING', label: 'Following', icon: Users },
];

const TAG_TABS: { id: FilterTagType; label: string; icon: LucideIcon }[] = [
    { id: 'ALL', label: 'All', icon: Globe },
    { id: 'REALTIME', label: 'Realtime', icon: Camera },
    { id: 'ART', label: 'Art', icon: ImageIcon },
    { id: 'PRODUCT', label: 'Product', icon: Package },
];

function MasonrySkeleton() {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-background/95 border border-primary/20 rounded-lg overflow-hidden animate-pulse break-inside-avoid"
                >
                    <div className="p-1">
                        <div className="aspect-4/3 w-full bg-primary/10 rounded-sm" />
                    </div>
                    <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-primary/10 rounded w-1/2" />
                            <div className="h-3 bg-primary/5 rounded w-1/4" />
                        </div>
                        <div className="h-3 bg-primary/5 rounded w-full" />
                        <div className="h-3 bg-primary/5 rounded w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    const t = useTranslations('trending');
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-muted-foreground/30">∅</span>
            </div>
            <p className="text-sm text-muted-foreground/60 font-mono uppercase tracking-widest text-center">
                {t('empty.title')}
                <br />
                {t('empty.description')}
            </p>
        </div>
    );
}

// Simple hook for responsive columns
function useBreakpointColumns() {
    const [cols, setCols] = useState(4);
    useEffect(() => {
        const updateCols = () => {
            if (window.innerWidth >= 1280)
                setCols(4); // xl
            else if (window.innerWidth >= 1024)
                setCols(3); // lg
            else if (window.innerWidth >= 640)
                setCols(2); // sm
            else setCols(1);
        };
        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);
    return cols;
}

export function TrendingGallery() {
    const t = useTranslations('trending');
    const [feedType, setFeedType] = useState<FeedType>('RECOMMEND');
    const [tagFilter, setTagFilter] = useState<FilterTagType>('ALL');
    const [timeRange, setTimeRange] = useState<string>('DAY');
    const [selectedBrickId, setSelectedBrickId] = useState<string | undefined>(undefined);

    // Prepare API filters
    const queryTagType = tagFilter === 'ALL' ? undefined : tagFilter;
    const queryTimeRange = timeRange === 'ALL' ? undefined : timeRange;

    // Call both hooks but only enable the active one for proper caching and performance
    const newsfeedQuery = useGetNewsfeedBricks(
        { tagType: queryTagType, timeRange: queryTimeRange, isPublic: true },
        20,
    );
    const followingQuery = useGetFollowingBricks({ tagType: queryTagType, isPublic: true }, 20);

    const activeQuery = feedType === 'RECOMMEND' ? newsfeedQuery : followingQuery;
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = activeQuery;

    // Flatten pages
    const bricks = useMemo(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data],
    ) as NewsfeedBrick[];

    const handleBrickClick = (brick: UserBrick | NewsfeedBrick) => {
        setSelectedBrickId(brick.id);
    };

    const isProductTab = tagFilter === 'PRODUCT';
    const columnCount = useBreakpointColumns();

    const renderContent = () => {
        if (isLoading) return <MasonrySkeleton />;
        if (bricks.length === 0) return <EmptyState />;

        if (isProductTab) {
            return (
                <ArtistBricksGrid
                    bricks={bricks}
                    isLoading={false}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={!!hasNextPage}
                    onLoadMore={() => fetchNextPage()}
                    onBrickClick={handleBrickClick as (brick: UserBrick) => void}
                />
            );
        }

        // Custom left-to-right Masonry layout based on current breakpoint
        const columns: NewsfeedBrick[][] = Array.from({ length: columnCount }, () => []);
        bricks.forEach((brick, index) => {
            columns[index % columnCount].push(brick);
        });

        return (
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start w-full">
                    {columns.map((col, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-4 min-w-0">
                            {col.map((brick) => (
                                <NewsfeedBrickCard
                                    key={brick.id}
                                    brick={brick}
                                    onClick={handleBrickClick as (brick: NewsfeedBrick) => void}
                                    className="w-full mb-0"
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {hasNextPage && (
                    <div className="flex justify-center pt-8">
                        <button
                            type="button"
                            onClick={() => fetchNextPage()}
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
                                    {t('actions.loading')}
                                </span>
                            ) : (
                                t('actions.loadMore')
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className="space-y-6">
            {/* Main Feed Type Navigation */}
            <div className="flex items-center gap-6 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-hide pb-4">
                {FEED_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = feedType === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFeedType(tab.id)}
                            className={cn(
                                'flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer text-sm font-bold uppercase tracking-widest',
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                                '-mb-[18px]', // Offset padding to align with container border
                            )}
                        >
                            <Icon
                                className={cn(
                                    'size-4',
                                    isActive && 'text-primary animate-pulse shadow-primary',
                                )}
                            />
                            {t(`tabs.${tab.id.toLowerCase()}`)}
                        </button>
                    );
                })}
            </div>

            {/* Sub-filters (Tags & Time) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {TAG_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tagFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setTagFilter(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer text-xs font-bold tracking-wider',
                                    isActive
                                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,238,255,0.15)]'
                                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {t(`tags.${tab.id.toLowerCase()}`)}
                            </button>
                        );
                    })}
                </div>

                {feedType === 'RECOMMEND' && (
                    <div className="shrink-0">
                        <TimeFilter value={timeRange} onChange={setTimeRange} />
                    </div>
                )}
            </div>

            {/* Grid Area */}
            {renderContent()}

            {/* Detail Modal */}
            <BrickDetailModal
                brickId={selectedBrickId}
                onClose={() => setSelectedBrickId(undefined)}
            />
        </section>
    );
}
