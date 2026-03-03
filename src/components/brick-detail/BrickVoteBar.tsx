'use client';

import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { BrickVoteStatus } from '@/types/brick.types';
import { useVoteBrick } from '@/hooks/apis/brick.api';

interface BrickVoteBarProps {
    brickId: string;
    voteStatus: BrickVoteStatus | undefined;
    onShowUpvoters: () => void;
}

export function BrickVoteBar({ brickId, voteStatus, onShowUpvoters }: BrickVoteBarProps) {
    const voteMutation = useVoteBrick();
    const [optimistic, setOptimistic] = useState<BrickVoteStatus | null>(null);

    const current = optimistic ?? voteStatus;
    const userVote = current?.userVote ?? null;
    const upvotes = current?.upvoteCount ?? 0;
    const downvotes = current?.downvoteCount ?? 0;
    const score = current?.score ?? 0;

    const handleVote = (value: 1 | -1) => {
        if (!current) return;

        // Optimistic update
        const isToggleOff = userVote === value;
        const newUserVote = isToggleOff ? null : value;

        let newUp = current.upvoteCount;
        let newDown = current.downvoteCount;

        // Remove old vote
        if (userVote === 1) newUp--;
        if (userVote === -1) newDown--;

        // Add new vote
        if (newUserVote === 1) newUp++;
        if (newUserVote === -1) newDown++;

        setOptimistic({
            userVote: newUserVote,
            upvoteCount: newUp,
            downvoteCount: newDown,
            score: newUp - newDown,
        });

        voteMutation.mutate(
            { brickId, value },
            {
                onSuccess: (data) => setOptimistic(data),
                onError: () => setOptimistic(null),
            },
        );
    };

    return (
        <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
                type="button"
                onClick={() => handleVote(1)}
                disabled={voteMutation.isPending}
                className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-sm transition-all cursor-pointer',
                    'text-xs font-bold uppercase tracking-wider',
                    userVote === 1
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent',
                )}
            >
                {voteMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <ArrowBigUp className="size-4" />
                )}
                <span>{upvotes}</span>
            </button>

            {/* Score badge – click to view upvoters */}
            <button
                type="button"
                onClick={onShowUpvoters}
                className={cn(
                    'text-xs font-mono font-bold px-2 py-0.5 rounded-sm transition-colors hover:underline cursor-pointer',
                    score > 0 && 'text-primary',
                    score < 0 && 'text-destructive',
                    score === 0 && 'text-muted-foreground',
                )}
                title="View upvoters"
            >
                {score > 0 ? `+${score}` : score}
            </button>

            {/* Downvote */}
            <button
                type="button"
                onClick={() => handleVote(-1)}
                disabled={voteMutation.isPending}
                className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-sm transition-all cursor-pointer',
                    'text-xs font-bold uppercase tracking-wider',
                    userVote === -1
                        ? 'bg-destructive/20 text-destructive border border-destructive/40'
                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent',
                )}
            >
                <ArrowBigDown className="size-4" />
                <span>{downvotes}</span>
            </button>
        </div>
    );
}
