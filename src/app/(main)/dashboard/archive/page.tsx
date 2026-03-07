'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Database, Search, Filter, Loader2 } from 'lucide-react';
import { useGetUserBricks } from '@/hooks/apis/brick.api';
import { BrickDetailModal } from '@/components/brick-detail';
import { ArchiveBrickCard, ArchiveSkeleton } from '@/components/archive';

export default function ArchivePage() {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrickId, setSelectedBrickId] = useState<string | undefined>(undefined);
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
        if (!searchQuery.trim()) return allBricks;
        const q = searchQuery.toLowerCase();
        return allBricks.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.description?.toLowerCase().includes(q) ||
                b.tagType.toLowerCase().includes(q),
        );
    }, [allBricks, searchQuery]);

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
                            Archive Repository
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono uppercase tracking-[0.2em] opacity-70">
                        {allBricks.length} Total Deployed Bricks / Network Verified
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search repository..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background/50 border border-primary/20 rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <button className="p-2 border border-primary/20 rounded-full hover:bg-primary/10 text-primary transition-colors">
                        <Filter className="size-4" />
                    </button>
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
                    <h3 className="text-lg font-bold text-foreground">Empty Repository</h3>
                    <p className="text-sm text-muted-foreground">
                        No bricks found in your local archive.
                    </p>
                </div>
            )}

            {/* Load More Indicator */}
            <div ref={loadMoreRef} className="flex justify-center py-12">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-3 text-primary animate-pulse">
                        <Loader2 className="size-5 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            Accessing Next Block...
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
