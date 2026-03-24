'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Database, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useGetOnchainActivities } from '@/hooks/apis/onchain.api';
import { timeAgo } from '@/utils/time';
import { useTranslations } from 'next-intl';

interface ActivitiesModalContentProps {
    onClose: () => void;
    idOrUsername: string;
}

const PAGE_SIZE = 20;

export function ActivitiesModalContent({ onClose, idOrUsername }: ActivitiesModalContentProps) {
    const t = useTranslations('artist.activities');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useGetOnchainActivities(idOrUsername, PAGE_SIZE);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        if (nearBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const activities = data?.pages.flatMap((p) => p.data) || [];
    const totalCount = data?.pages[0]?.total || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-background border border-primary/20 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,238,255,0.1)]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2 text-primary">
                        <Database className="size-5" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">
                            {t('title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="bg-muted py-2 px-6 border-b border-primary/5">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {t('totalRecords', { count: totalCount.toLocaleString() })}
                    </p>
                </div>

                {/* List */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="max-h-96 overflow-y-auto scrollbar-hide"
                >
                    {activities.length === 0 && isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-muted-foreground font-mono">
                                {t('noActivities')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-primary/5">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p
                                            className={`text-xs font-mono font-bold ${
                                                activity.type === 'DONATE'
                                                    ? 'text-secondary'
                                                    : 'text-primary'
                                            }`}
                                        >
                                            {activity.type}_
                                            {activity.brickId.substring(0, 8).toUpperCase()}
                                        </p>
                                        <Link
                                            href={`https://amoy.polygonscan.com/tx/${activity.txHash}`}
                                            target="_blank"
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            <span className="text-[10px] uppercase font-mono hidden sm:inline-block">
                                                Tx
                                            </span>
                                            <ExternalLink className="size-3" />
                                        </Link>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[13px] text-muted-foreground">
                                            {activity.type === 'MINT'
                                                ? t('mintDesc')
                                                : t('donateDesc')}
                                        </p>
                                        <p className="text-[10px] font-mono text-muted-foreground/60">
                                            {timeAgo(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isFetchingNextPage && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-5 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
