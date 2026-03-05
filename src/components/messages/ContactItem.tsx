'use client';

import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { timeAgo } from '@/utils/time';
import { getAvatarUrl } from '@/utils/cloudinary';
import type { Conversation } from '@/types/message.types';

interface ContactItemProps {
    conversation: Conversation;
    isActive: boolean;
    currentUserId?: string;
    onClick: () => void;
}

export function ContactItem({ conversation, isActive, currentUserId, onClick }: ContactItemProps) {
    const { partner, lastMessage, unreadCount } = conversation;
    const hasUnread = unreadCount > 0;

    // Build last message preview
    let preview = '';
    if (lastMessage) {
        const isMe = lastMessage.senderId === currentUserId;
        const prefix = isMe ? 'You: ' : '';

        if (lastMessage.content) {
            preview = prefix + lastMessage.content;
        } else if (lastMessage.images?.length > 0) {
            preview = prefix + '📷 Image';
        } else if (lastMessage.voice) {
            preview = prefix + '🎤 Voice message';
        } else if (lastMessage.file) {
            preview = prefix + '📎 ' + lastMessage.file.fileName;
        } else if (lastMessage.brickId) {
            preview = prefix + '🧱 Brick shared';
        }
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded cursor-pointer transition-all',
                isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent group',
            )}
        >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
                <Image
                    src={getAvatarUrl(partner.avatar, partner.gender)}
                    alt={partner.username}
                    width={40}
                    height={40}
                    className={cn(
                        'size-10 rounded-full bg-muted object-cover border border-primary/20',
                        !isActive && 'opacity-80 group-hover:opacity-100',
                    )}
                />
                {partner.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-primary rounded-full border-2 border-background shadow-[0_0_6px_rgba(0,238,255,0.5)]" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <p
                        className={cn(
                            'text-sm font-bold truncate',
                            isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground group-hover:text-foreground',
                        )}
                    >
                        {partner.username}
                    </p>
                    {lastMessage && (
                        <span
                            className={cn(
                                'text-[9px] shrink-0 ml-2',
                                isActive ? 'text-primary/60' : 'text-muted-foreground/60',
                            )}
                        >
                            {timeAgo(lastMessage.createdAt)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <p
                        className={cn(
                            'text-[11px] truncate flex-1',
                            hasUnread
                                ? 'text-foreground font-medium'
                                : isActive
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/60',
                        )}
                    >
                        {preview || 'Start a conversation'}
                    </p>
                    {hasUnread && (
                        <span className="shrink-0 bg-primary text-primary-foreground text-[9px] font-bold rounded-full size-4 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
