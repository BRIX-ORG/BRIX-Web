'use client';

import { cn } from '@/utils/classnames';
import type { MessageReactions } from '@/types/message.types';

interface MessageReactionsDisplayProps {
    reactions: MessageReactions | null;
    isMe: boolean;
    currentUserId?: string;
    partnerName: string;
    onToggle: (emoji: string) => void;
}

export function MessageReactionsDisplay({
    reactions,
    isMe,
    currentUserId,
    partnerName,
    onToggle,
}: MessageReactionsDisplayProps) {
    if (!reactions) return null;
    const entries = Object.entries(reactions).filter(([, users]) => users.length > 0);
    if (entries.length === 0) return null;

    const getTooltip = (userIds: string[]) => {
        const names = userIds.map((id) => (id === currentUserId ? 'You' : partnerName));
        return names.join(' and ');
    };

    return (
        <div className={cn('flex flex-wrap gap-1 mt-1', isMe && 'justify-end')}>
            {entries.map(([emoji, users]) => (
                <div key={emoji} className="group/reaction relative">
                    <button
                        type="button"
                        onClick={() => onToggle(emoji)}
                        className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors cursor-pointer',
                            users.includes(currentUserId ?? '')
                                ? 'bg-primary/10 border-primary/40 text-foreground'
                                : 'bg-muted/80 border-border text-muted-foreground hover:border-primary/40',
                        )}
                    >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-bold">{users.length}</span>
                    </button>
                    <div
                        className={cn(
                            'absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none',
                            'opacity-0 group-hover/reaction:opacity-100 transition-opacity duration-150',
                            'bg-popover border border-border text-foreground text-[10px] font-medium',
                            'px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50',
                        )}
                    >
                        {getTooltip(users)}
                    </div>
                </div>
            ))}
        </div>
    );
}
