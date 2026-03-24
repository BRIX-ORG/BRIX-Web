'use client';

import { useTranslations } from 'next-intl';
import { Users, Star, UserCheck, Sparkles } from 'lucide-react';
import { useGetFollowRecommendations, useGetTopUsers } from '@/hooks/apis/user.api';
import { useGetTopAuthors } from '@/hooks/apis/brick.api';
import { UserCard, UserMap } from '@/components/network';
import { cn } from '@/utils/classnames';

export default function NetworkPage() {
    const t = useTranslations('network');
    const tc = useTranslations('common');

    const {
        data: recommendations,
        isLoading: isLoadingRecs,
        hasNextPage: hasNextPageRecs,
        fetchNextPage: fetchNextRecs,
        isFetchingNextPage: isFetchingRecs,
    } = useGetFollowRecommendations(8);

    const {
        data: topAuthors,
        isLoading: isLoadingAuthors,
        hasNextPage: hasNextPageAuthors,
        fetchNextPage: fetchNextAuthors,
        isFetchingNextPage: isFetchingAuthors,
    } = useGetTopAuthors(12);

    const {
        data: topUsers,
        isLoading: isLoadingUsers,
        hasNextPage: hasNextPageUsers,
        fetchNextPage: fetchNextUsers,
        isFetchingNextPage: isFetchingUsers,
    } = useGetTopUsers(12);

    const recsList = recommendations?.pages.flatMap((p) => p.data) || [];
    const authorsList = topAuthors?.pages.flatMap((p) => p.data) || [];
    const usersList = topUsers?.pages.flatMap((p) => p.data) || [];

    return (
        <div className="container mx-auto py-8 px-4 lg:px-8 space-y-12">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute -inset-4 bg-linear-to-r from-primary/10 via-purple-500/5 to-transparent rounded-3xl blur-2xl opacity-50" />
                <div className="relative flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3">
                        <UserCheck className="size-8 text-primary animate-pulse" />
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground/80 max-w-2xl font-medium">
                        {t('description')}
                    </p>
                </div>
            </div>

            <UserMap />

            {/* Recommendations Grid - "For You" */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                        <Sparkles className="size-5 text-primary" />
                        {t('sections.recommendations.title')}
                    </h2>
                </div>

                {isLoadingRecs ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-72 rounded-2xl bg-primary/5 animate-pulse border border-primary/10"
                            />
                        ))}
                    </div>
                ) : recsList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recsList.map((user) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5">
                        <Users className="size-12 text-primary/20 mb-4" />
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                            {t('sections.recommendations.empty.title')}
                        </p>
                        <p className="text-muted-foreground/60 text-xs text-center mt-1">
                            {t('sections.recommendations.empty.description')}
                        </p>
                    </div>
                )}

                {hasNextPageRecs && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => fetchNextRecs()}
                            disabled={isFetchingRecs}
                            className="px-6 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                        >
                            {isFetchingRecs
                                ? tc('loading')
                                : t('sections.recommendations.loadMore')}
                        </button>
                    </div>
                )}
            </section>

            {/* Global Top Authors - Horizontal Scroll */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                        <Star className="size-5 text-primary" />
                        {t('sections.topAuthors.title')}
                    </h2>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-6 overflow-x-auto pt-4 pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent',
                        'mask-fade-horizontal',
                    )}
                >
                    {isLoadingAuthors ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[240px] h-72 rounded-2xl bg-primary/5 animate-pulse border border-primary/10"
                            />
                        ))
                    ) : (
                        <>
                            {authorsList.map((author) => (
                                <UserCard key={author.id} user={author} className="shrink-0" />
                            ))}
                            {hasNextPageAuthors && (
                                <button
                                    onClick={() => fetchNextAuthors()}
                                    disabled={isFetchingAuthors}
                                    className="shrink-0 min-w-[200px] h-72 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/10 transition-all group/more"
                                >
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover/more:scale-110 transition-transform">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">
                                        {isFetchingAuthors
                                            ? tc('loading')
                                            : t('sections.topAuthors.viewMore')}
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Global Top Users - Horizontal Scroll */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                        <Users className="size-5 text-primary" />
                        {t('sections.topUsers.title')}
                    </h2>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-6 overflow-x-auto pt-4 pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent',
                        'mask-fade-horizontal',
                    )}
                >
                    {isLoadingUsers ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[240px] h-72 rounded-2xl bg-primary/5 animate-pulse border border-primary/10"
                            />
                        ))
                    ) : (
                        <>
                            {usersList.map((user) => (
                                <UserCard key={user.id} user={user} className="shrink-0" />
                            ))}
                            {hasNextPageUsers && (
                                <button
                                    onClick={() => fetchNextUsers()}
                                    disabled={isFetchingUsers}
                                    className="shrink-0 min-w-[200px] h-72 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/10 transition-all group/more"
                                >
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover/more:scale-110 transition-transform">
                                        <Users className="size-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">
                                        {isFetchingUsers
                                            ? tc('loading')
                                            : t('sections.topUsers.viewMore')}
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CSS for custom scrollbars and masking if needed elsewhere */}
            <style jsx global>{`
                .mask-fade-horizontal {
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
