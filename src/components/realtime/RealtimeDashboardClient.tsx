'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { useGetRealtimeBricks, useGetUserStats } from '@/hooks/apis/brick.api';
import { useGetOnchainDonations } from '@/hooks/apis/onchain.api';
import { RealtimeStatsRow, RealtimeBrickCard, RecentDonationsList } from '@/components/realtime';
import {
    Loader2,
    BoxSelect,
    CheckCircle2,
    CloudUpload,
    Clock,
    AlertCircle,
    type LucideIcon,
} from 'lucide-react';
import { BrickDetailModal } from '@/components/brick-detail';
import GooeyNav from '@/components/react-bits/GooeyNav';

type FilterType = 'all' | 'pending' | 'ipfs_uploaded' | 'onchain' | 'failed';

export function RealtimeDashboardClient() {
    const t = useTranslations('realtime');
    const tc = useTranslations('common');
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [filter, setFilter] = useState<FilterType>('all');

    const FILTER_OPTIONS: { label: string; value: FilterType; icon: LucideIcon }[] = useMemo(
        () => [
            { label: t('filters.all'), value: 'all', icon: BoxSelect },
            { label: t('filters.onchain'), value: 'onchain', icon: CheckCircle2 },
            { label: t('filters.ipfs_uploaded'), value: 'ipfs_uploaded', icon: CloudUpload },
            { label: t('filters.pending'), value: 'pending', icon: Clock },
            { label: t('filters.failed'), value: 'failed', icon: AlertCircle },
        ],
        [t],
    );

    const { data: stats } = useGetUserStats(userId);

    const {
        data: bricksData,
        isLoading: isBricksLoading,
        fetchNextPage: fetchNextBricks,
        hasNextPage: hasNextBricks,
        isFetchingNextPage: isFetchingNextBricks,
    } = useGetRealtimeBricks({
        idOrUsername: userId,
        onChainStatus: filter === 'all' ? undefined : filter,
        limit: 12,
    });

    const [selectedBrickId, setSelectedBrickId] = useState<string | null>(null);

    const {
        data: donationsData,
        fetchNextPage: fetchNextDonations,
        hasNextPage: hasNextDonations,
    } = useGetOnchainDonations(userId, 10);

    const bricks = bricksData?.pages.flatMap((p) => p.data) || [];
    const donations = donationsData?.pages.flatMap((p) => p.data) || [];

    if (!userId) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-[1600px] mx-auto min-h-[100dvh]">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground max-w-[65ch] leading-relaxed">
                    {t('description')}
                </p>
            </header>

            {/* The Wide Data Stream (Stats) */}
            <RealtimeStatsRow stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {/* Filters */}
                    <div className="flex items-center p-1 bg-muted/20 backdrop-blur-md rounded-full border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] scrollbar-hide w-fit relative z-20">
                        <GooeyNav
                            items={FILTER_OPTIONS}
                            activeValue={filter}
                            onChange={(val) => setFilter(val as FilterType)}
                        />
                    </div>

                    {/* Intelligent Grid */}
                    {isBricksLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : bricks.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {bricks.map((brick, i) => (
                                    <RealtimeBrickCard
                                        key={brick.id}
                                        brick={brick}
                                        index={i}
                                        onClick={() => setSelectedBrickId(brick.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/50 rounded-3xl bg-muted/10"
                        >
                            <BoxSelect className="size-10 text-muted-foreground/30 mb-4" />
                            <h3 className="text-sm font-semibold text-foreground mb-1">
                                {t('empty.title')}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-[40ch] text-center">
                                {t('empty.description')}
                            </p>
                        </motion.div>
                    )}

                    {/* Load More */}
                    {hasNextBricks && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => fetchNextBricks()}
                                disabled={isFetchingNextBricks}
                                className="px-6 py-2.5 rounded-full bg-muted/50 hover:bg-muted text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                                {isFetchingNextBricks ? tc('loading') : t('actions.loadMore')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Recent Donations */}
                <aside className="lg:col-span-4 xl:col-span-3 sticky top-6">
                    <RecentDonationsList
                        donations={donations}
                        onLoadMore={() => fetchNextDonations()}
                        hasMore={hasNextDonations}
                    />
                </aside>
            </div>

            <BrickDetailModal
                brickId={selectedBrickId || undefined}
                onClose={() => setSelectedBrickId(null)}
            />
        </div>
    );
}
