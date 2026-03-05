'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SmilePlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/utils/classnames';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export interface Reaction {
    emoji: string;
    count: number;
    reacted: boolean;
}

export interface Message {
    id: string;
    content: string;
    sender: 'me' | 'other';
    senderName?: string;
    senderAvatar?: string;
    timestamp?: string;
    status?: 'sent' | 'delivered' | 'read';
    reactions?: Reaction[];
}

interface MessageBubbleProps {
    message: Message;
    onReaction?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, onReaction }: MessageBubbleProps) {
    const isMe = message.sender === 'me';
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const reactionPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showReactionPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                reactionPickerRef.current &&
                !reactionPickerRef.current.contains(e.target as Node)
            ) {
                setShowReactionPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showReactionPicker]);

    const handleReactionSelect = (emojiData: EmojiClickData) => {
        onReaction?.(message.id, emojiData.emoji);
        setShowReactionPicker(false);
    };

    return (
        <div
            className={cn('group flex items-end gap-3 max-w-[80%]', isMe && 'justify-end ml-auto')}
        >
            {/* Other's Avatar */}
            {!isMe && message.senderAvatar && (
                <Image
                    src={message.senderAvatar}
                    alt={`Avatar for ${message.senderName}`}
                    width={32}
                    height={32}
                    className="size-8 rounded bg-muted shrink-0 object-cover"
                />
            )}

            <div className={cn('flex flex-col gap-1', isMe && 'items-end')}>
                {/* Sender Name */}
                {!isMe && message.senderName && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1">
                        {message.senderName.toUpperCase()}
                    </p>
                )}

                {/* Message Bubble */}
                <div className="relative">
                    <div
                        className={cn(
                            'p-4 rounded-sm text-sm leading-relaxed',
                            isMe
                                ? 'bg-primary/5 border border-primary/30 text-foreground text-right'
                                : 'bg-muted/80 border border-border text-foreground',
                        )}
                    >
                        {message.content}
                    </div>

                    {/* Reaction button (appears on hover) */}
                    <button
                        type="button"
                        onClick={() => setShowReactionPicker((prev) => !prev)}
                        className={cn(
                            'absolute -bottom-3 opacity-0 group-hover:opacity-100 transition-opacity size-6 flex items-center justify-center bg-muted border border-border rounded-full hover:border-primary hover:text-primary text-muted-foreground',
                            isMe ? 'left-0' : 'right-0',
                        )}
                    >
                        <SmilePlus className="size-3" />
                    </button>

                    {/* Reaction Picker */}
                    {showReactionPicker && (
                        <div
                            ref={reactionPickerRef}
                            className={cn('absolute bottom-8 z-50', isMe ? 'right-0' : 'left-0')}
                        >
                            <EmojiPicker
                                onEmojiClick={handleReactionSelect}
                                theme={Theme.DARK}
                                emojiStyle={EmojiStyle.APPLE}
                                reactionsDefaultOpen
                                lazyLoadEmojis
                                width={350}
                                height={450}
                            />
                        </div>
                    )}
                </div>

                {/* Reactions Display */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className={cn('flex flex-wrap gap-1 mt-1', isMe && 'justify-end')}>
                        {message.reactions.map((reaction) => (
                            <button
                                key={reaction.emoji}
                                type="button"
                                onClick={() => onReaction?.(message.id, reaction.emoji)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors',
                                    reaction.reacted
                                        ? 'bg-primary/10 border-primary/40 text-primary'
                                        : 'bg-muted/80 border-border text-muted-foreground hover:border-primary/40',
                                )}
                            >
                                <span>{reaction.emoji}</span>
                                <span className="text-[10px] font-bold">{reaction.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Status */}
                {isMe && message.status && (
                    <p className="text-[10px] font-bold text-primary/40 mr-1">
                        YOU · {message.status.toUpperCase()}
                    </p>
                )}
            </div>

            {/* My Avatar */}
            {isMe && (
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ88P-FRzRf5zWL-X7tVPXUoS7SecoZ0T8oQNlph_gPcslfG_0XG5X2PqjO9rxoiBsMHl5v8Qtfovp1O6-NHU4BiErUvaTlAMtitIAY242y3QbFa_WdsAOwT6LwW0uYjOv-l_am_ZsPltu-HhKIkPNstXI5ySKQf2_oJDuRzPjjLNo8-PAY_QqtTzj0od_f0PxIr9l56bHUtzBb0D5jNyo0MVk5NIbJyTO_Ay8kTFpNTpZCpILouj2uFZoTlbeymSVa9NsTWTHSZ8"
                    alt="Your avatar"
                    width={32}
                    height={32}
                    className="size-8 rounded shrink-0 border border-primary/20 object-cover"
                />
            )}
        </div>
    );
}
