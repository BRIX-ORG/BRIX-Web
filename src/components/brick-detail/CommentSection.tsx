'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import type { BrickComment } from '@/types/brick.types';
import { useGetBrickComments } from '@/hooks/apis/brick.api';
import { CommentItem, CommentInput, UpvotersModal } from '@/components/brick-detail';

interface CommentSectionProps {
    brickId: string;
    totalComments: number;
    currentUserId?: string;
}

export function CommentSection({ brickId, totalComments, currentUserId }: CommentSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [upvoterTarget, setUpvoterTarget] = useState<string | null>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useGetBrickComments(brickId);

    const comments: BrickComment[] = useMemo(
        () => data?.pages.flatMap((page) => page.comments) ?? [],
        [data],
    );

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || !hasNextPage || isFetchingNextPage) return;

        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        if (nearBottom) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 shrink-0">
                <MessageCircle className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                    Comments ({totalComments})
                </h3>
            </div>

            {/* Comments list */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 scrollbar-hide"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <MessageCircle className="size-8 text-muted-foreground/20" />
                        <p className="text-xs text-muted-foreground/50 font-mono">
                            No comments yet. Be the first!
                        </p>
                    </div>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                brickId={brickId}
                                currentUserId={currentUserId}
                                onShowUpvoters={(id) => setUpvoterTarget(id)}
                            />
                        ))}
                        {isFetchingNextPage && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-primary" />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Comment input */}
            <CommentInput brickId={brickId} />

            {/* Upvoters modal for comments */}
            <UpvotersModal
                isOpen={!!upvoterTarget}
                onClose={() => setUpvoterTarget(null)}
                targetId={upvoterTarget ?? ''}
                type="comment"
            />
        </div>
    );
}
