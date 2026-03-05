'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, SmilePlus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/utils/classnames';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageActionsProps {
    isMe: boolean;
    isSending: boolean;
    hasContent: boolean;
    onReaction: (emoji: string) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function MessageActions({
    isMe,
    isSending,
    hasContent,
    onReaction,
    onEdit,
    onDelete,
}: MessageActionsProps) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const reactionButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showReactionPicker && !showMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                reactionPickerRef.current &&
                !reactionPickerRef.current.contains(e.target as Node) &&
                reactionButtonRef.current &&
                !reactionButtonRef.current.contains(e.target as Node)
            ) {
                setShowReactionPicker(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showReactionPicker, showMenu]);

    const handleReactionSelect = (emojiData: EmojiClickData) => {
        onReaction(emojiData.emoji);
        setShowReactionPicker(false);
    };

    return (
        <>
            {/* Actions overlay (hover) */}
            <div
                className={cn(
                    'absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10',
                    isMe ? 'left-0' : 'right-0',
                )}
            >
                {/* Reaction button */}
                <button
                    ref={reactionButtonRef}
                    type="button"
                    onClick={() => setShowReactionPicker((prev) => !prev)}
                    className="size-6 flex items-center justify-center bg-muted border border-border rounded-full hover:border-primary hover:text-primary text-muted-foreground cursor-pointer transition-colors"
                >
                    <SmilePlus className="size-3" />
                </button>

                {/* Menu button (own messages only) */}
                {isMe && !isSending && (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setShowMenu((prev) => !prev)}
                            className="size-6 flex items-center justify-center bg-muted border border-border rounded-full hover:border-primary hover:text-primary text-muted-foreground cursor-pointer transition-colors"
                        >
                            <MoreHorizontal className="size-3" />
                        </button>

                        {showMenu && (
                            <div className="absolute top-7 right-0 bg-popover border border-border rounded-sm shadow-lg py-1 min-w-30 z-50">
                                {hasContent && (
                                    <button
                                        onClick={() => {
                                            onEdit();
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="size-3" />
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-destructive hover:bg-muted transition-colors"
                                >
                                    <Trash2 className="size-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
        </>
    );
}
