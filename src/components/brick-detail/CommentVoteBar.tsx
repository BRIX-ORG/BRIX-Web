'use client';

import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { BrickVoteStatus } from '@/types/brick.types';
import { useVoteComment } from '@/hooks/apis/brick.api';

interface CommentVoteBarProps {
    commentId: string;
    voteStatus: BrickVoteStatus | undefined;
    onShowUpvoters: () => void;
}

export function CommentVoteBar({ commentId, voteStatus, onShowUpvoters }: CommentVoteBarProps) {
    const voteMutation = useVoteComment();
    const [optimistic, setOptimistic] = useState<BrickVoteStatus | null>(null);

    const current = optimistic ?? voteStatus;
    const userVote = current?.userVote ?? null;
    // const upvotes = current?.upvoteCount ?? 0;
    // const downvotes = current?.downvoteCount ?? 0;
    const score = current?.score ?? 0;

    const handleVote = (value: 1 | -1) => {
        if (!current) return;

        const isToggleOff = userVote === value;
        const newUserVote = isToggleOff ? null : value;

        let newUp = current.upvoteCount;
        let newDown = current.downvoteCount;

        if (userVote === 1) newUp--;
        if (userVote === -1) newDown--;
        if (newUserVote === 1) newUp++;
        if (newUserVote === -1) newDown++;

        setOptimistic({
            userVote: newUserVote,
            upvoteCount: newUp,
            downvoteCount: newDown,
            score: newUp - newDown,
        });

        voteMutation.mutate(
            { commentId, value },
            {
                onSuccess: (data) => setOptimistic(data),
                onError: () => setOptimistic(null),
            },
        );
    };

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => handleVote(1)}
                disabled={voteMutation.isPending}
                className={cn(
                    'p-0.5 rounded transition-colors cursor-pointer',
                    userVote === 1 ? 'text-primary' : 'text-muted-foreground/60 hover:text-primary',
                )}
            >
                <ArrowBigUp className="size-3.5" />
            </button>

            <button
                type="button"
                onClick={onShowUpvoters}
                className={cn(
                    'text-[10px] font-mono font-bold hover:underline cursor-pointer min-w-4 text-center',
                    score > 0 && 'text-primary',
                    score < 0 && 'text-destructive',
                    score === 0 && 'text-muted-foreground/60',
                )}
            >
                {score}
            </button>

            <button
                type="button"
                onClick={() => handleVote(-1)}
                disabled={voteMutation.isPending}
                className={cn(
                    'p-0.5 rounded transition-colors cursor-pointer',
                    userVote === -1
                        ? 'text-destructive'
                        : 'text-muted-foreground/60 hover:text-destructive',
                )}
            >
                <ArrowBigDown className="size-3.5" />
            </button>

            {voteMutation.isPending && (
                <Loader2 className="size-3 animate-spin text-muted-foreground/40" />
            )}
        </div>
    );
}
