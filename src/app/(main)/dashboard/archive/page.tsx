'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Database, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { useGetUserBricks } from '@/hooks/apis/brick.api';
import { BrickDetailModal } from '@/components/brick-detail';
import {
    ArchiveBrickCard,
    ArchiveSkeleton,
    ArchiveFilterPopup,
    ArchiveFilters,
} from '@/components/archive';
import { useTranslations } from 'next-intl';

export default function ArchivePage() {
    const t = useTranslations('archive');
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrickId, setSelectedBrickId] = useState<string | undefined>(undefined);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<ArchiveFilters>({
        tagType: 'ALL',
        mediaType: 'ALL',
        isPublic: 'ALL',
        dateFilterType: 'none',
        dateFilterValue: '',
    });
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const userId = session?.user?.id;
    const username = session?.user?.username;

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetUserBricks(
        username || userId || '',
        undefined,
        24,
    );

    const allBricks = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    const filteredBricks = useMemo(() => {
        let result = allBricks;

        // Search Query Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.description?.toLowerCase().includes(q) ||
                    b.tagType.toLowerCase().includes(q),
            );
        }

        // Tag Type Filter
        if (filters.tagType && filters.tagType !== 'ALL') {
            result = result.filter((b) => b.tagType === filters.tagType);
        }

        // Media Type Filter
        if (filters.mediaType && filters.mediaType !== 'ALL') {
            result = result.filter((b) => b.mediaType === filters.mediaType);
        }

        // Visibility Filter
        if (filters.isPublic !== undefined && filters.isPublic !== 'ALL') {
            result = result.filter((b) => b.isPublic === filters.isPublic);
        }

        // Date Filter
        if (filters.dateFilterType !== 'none' && filters.dateFilterValue.trim() !== '') {
            const val = filters.dateFilterValue.trim();
            result = result.filter((b) => {
                const date = new Date(b.createdAt);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear().toString();

                if (filters.dateFilterType === 'day') {
                    // Expected format: DD/MM/YYYY
                    return val === `${day}/${month}/${year}`;
                }
                if (filters.dateFilterType === 'month') {
                    // Expected format: MM/YYYY
                    return val === `${month}/${year}`;
                }
                if (filters.dateFilterType === 'year') {
                    // Expected format: YYYY
                    return val === year;
                }
                return true;
            });
        }

        return result;
    }, [allBricks, searchQuery, filters]);

    // Handle infinite scroll
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!session) return null;

    return (
        <div className="p-8 max-w-280 mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/20">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary">
                        <Database className="size-6" />
                        <h1 className="text-2xl font-bold tracking-tight uppercase">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono uppercase tracking-[0.2em] opacity-70">
                        {t('subtitle', { count: allBricks.length })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background/50 border border-primary/20 rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn(
                                'p-2 border rounded-full transition-all duration-300',
                                isFilterOpen ||
                                    filters.tagType !== 'ALL' ||
                                    filters.mediaType !== 'ALL' ||
                                    filters.isPublic !== 'ALL'
                                    ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                    : 'border-primary/20 hover:bg-primary/10 text-primary',
                            )}
                        >
                            <Filter className="size-4" />
                        </button>

                        <ArchiveFilterPopup
                            isOpen={isFilterOpen}
                            filters={filters}
                            onFiltersChange={setFilters}
                            onClose={() => setIsFilterOpen(false)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            {isLoading ? (
                <ArchiveSkeleton />
            ) : filteredBricks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBricks.map((brick) => (
                        <ArchiveBrickCard
                            key={brick.id}
                            brick={brick}
                            onClick={(b) => setSelectedBrickId(b.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-primary/10 rounded-2xl bg-primary/5">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Database className="size-8 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('empty.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('empty.description')}</p>
                </div>
            )}

            {/* Load More Indicator */}
            <div ref={loadMoreRef} className="flex justify-center py-12">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-3 text-primary animate-pulse">
                        <Loader2 className="size-5 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {t('loading')}
                        </span>
                    </div>
                )}
            </div>

            {/* Brick Detail Modal */}
            <BrickDetailModal
                brickId={selectedBrickId}
                onClose={() => setSelectedBrickId(undefined)}
            />
        </div>
    );
}
