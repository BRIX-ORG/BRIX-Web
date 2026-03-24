'use client';

import { useEffect, useRef, useState, useCallback, useReducer } from 'react';
import { X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { FollowUser } from '@/types/user.types';
import { useGetFollowers, useGetFollowing } from '@/hooks/apis/user.api';
import { FollowUserItem } from '@/components/artist';
import { useTranslations } from 'next-intl';

type ModalTab = 'followers' | 'following';

const PAGE_SIZE = 20;

// ─── Reducer to accumulate pages without effects ──────────

type PagesState = { pages: Map<number, FollowUser[]>; list: FollowUser[] };
type PagesAction = { type: 'add'; page: number; data: FollowUser[] };

function pagesReducer(state: PagesState, action: PagesAction): PagesState {
    if (state.pages.has(action.page)) return state;
    const newPages = new Map(state.pages);
    newPages.set(action.page, action.data);
    const list: FollowUser[] = [];
    for (let i = 0; i <= Math.max(...newPages.keys()); i++) {
        const page = newPages.get(i);
        if (page) list.push(...page);
    }
    return { pages: newPages, list };
}

const initialPagesState: PagesState = { pages: new Map(), list: [] };

// ──────────────────────────────────────────────────────────

interface FollowersModalContentProps {
    onClose: () => void;
    idOrUsername: string;
    currentUserId?: string;
    initialTab: ModalTab;
    followersCount: number;
    followingCount: number;
}

export function FollowersModalContent({
    onClose,
    idOrUsername,
    currentUserId,
    initialTab,
    followersCount,
    followingCount,
}: FollowersModalContentProps) {
    const t = useTranslations('artist.followers');
    const [activeTab, setActiveTab] = useState<ModalTab>(initialTab);
    const [followersPage, setFollowersPage] = useState(0);
    const [followingPage, setFollowingPage] = useState(0);
    const [followersState, dispatchFollowers] = useReducer(pagesReducer, initialPagesState);
    const [followingState, dispatchFollowing] = useReducer(pagesReducer, initialPagesState);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch current page of followers
    const { data: followersData, isLoading: isLoadingFollowers } = useGetFollowers(
        idOrUsername,
        PAGE_SIZE,
        followersPage * PAGE_SIZE,
    );

    // Fetch current page of following
    const { data: followingData, isLoading: isLoadingFollowing } = useGetFollowing(
        idOrUsername,
        PAGE_SIZE,
        followingPage * PAGE_SIZE,
    );

    // Dispatch new page data during render (safe — reducer is idempotent)
    if (followersData?.data && !followersState.pages.has(followersPage)) {
        dispatchFollowers({ type: 'add', page: followersPage, data: followersData.data });
    }
    if (followingData?.data && !followingState.pages.has(followingPage)) {
        dispatchFollowing({ type: 'add', page: followingPage, data: followingData.data });
    }

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        if (!nearBottom) return;

        if (activeTab === 'followers' && !isLoadingFollowers) {
            const total = followersData?.total ?? 0;
            if (followersState.list.length < total) {
                setFollowersPage((p) => p + 1);
            }
        }
        if (activeTab === 'following' && !isLoadingFollowing) {
            const total = followingData?.total ?? 0;
            if (followingState.list.length < total) {
                setFollowingPage((p) => p + 1);
            }
        }
    }, [
        activeTab,
        isLoadingFollowers,
        isLoadingFollowing,
        followersData?.total,
        followingData?.total,
        followersState.list.length,
        followingState.list.length,
    ]);

    // Close on escape & lock body scroll
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

    const currentList = activeTab === 'followers' ? followersState.list : followingState.list;
    const isLoading = activeTab === 'followers' ? isLoadingFollowers : isLoadingFollowing;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-background border border-primary/20 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,238,255,0.1)]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
                    <Link
                        href={`/dashboard/artist/${idOrUsername}`}
                        className="hover:text-primary transition-colors"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-widest">
                            {idOrUsername}
                        </h2>
                    </Link>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-primary/10">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest text-center transition-colors cursor-pointer ${
                            activeTab === 'followers'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {t('followersTab', { count: followersCount.toLocaleString() })}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest text-center transition-colors cursor-pointer ${
                            activeTab === 'following'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {t('followingTab', { count: followingCount.toLocaleString() })}
                    </button>
                </div>

                {/* List */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="max-h-96 overflow-y-auto scrollbar-hide"
                >
                    {currentList.length === 0 && isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                    ) : currentList.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-muted-foreground font-mono">
                                {activeTab === 'followers' ? t('noFollowers') : t('noFollowing')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {currentList.map((user) => (
                                <FollowUserItem
                                    key={user.id}
                                    user={user}
                                    currentUserId={currentUserId}
                                />
                            ))}
                            {isLoading && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-5 animate-spin text-primary" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
