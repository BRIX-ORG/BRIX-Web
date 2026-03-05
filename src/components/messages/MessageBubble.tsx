'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Check,
    CheckCheck,
    Clock,
    FileIcon,
    MoreHorizontal,
    Pencil,
    SmilePlus,
    Trash2,
    X,
    Download,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/utils/classnames';
import { timeAgo, formatDateTime } from '@/utils/time';
import type { Message, MessageReactions } from '@/types/message.types';
import { getAvatarUrl } from '@/utils/cloudinary';
import type { ConversationPartner } from '@/types/message.types';
import { ConfirmPopup } from '@/components/shared';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    partner: ConversationPartner;
    currentUserAvatar?: string;
    onReaction?: (messageId: string, emoji: string) => void;
    onEdit?: (messageId: string, content: string) => void;
    onDelete?: (messageId: string) => void;
}

export function MessageBubble({
    message,
    isMe,
    partner,
    currentUserAvatar,
    onReaction,
    onEdit,
    onDelete,
}: MessageBubbleProps) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isSending = message._status === 'sending';
    const isFailed = message._status === 'failed';
    const isEdited = message.updatedAt !== message.createdAt;

    useEffect(() => {
        if (!showReactionPicker && !showMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                reactionPickerRef.current &&
                !reactionPickerRef.current.contains(e.target as Node)
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
        onReaction?.(message.id, emojiData.emoji);
        setShowReactionPicker(false);
    };

    const handleSaveEdit = () => {
        const trimmed = editContent.trim();
        if (trimmed && trimmed !== message.content) {
            onEdit?.(message.id, trimmed);
        }
        setIsEditing(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditContent(message.content);
        }
    };

    // Render reactions
    const renderReactions = (reactions: MessageReactions | null) => {
        if (!reactions) return null;
        const entries = Object.entries(reactions).filter(([, users]) => users.length > 0);
        if (entries.length === 0) return null;

        return (
            <div className={cn('flex flex-wrap gap-1 mt-1', isMe && 'justify-end')}>
                {entries.map(([emoji, users]) => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => onReaction?.(message.id, emoji)}
                        className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors cursor-pointer',
                            'bg-muted/80 border-border text-muted-foreground hover:border-primary/40',
                        )}
                    >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-bold">{users.length}</span>
                    </button>
                ))}
            </div>
        );
    };

    // Status icon for sent messages
    const renderStatus = () => {
        if (!isMe) return null;

        if (isSending) return <Clock className="size-3 text-muted-foreground/40" />;
        if (isFailed) return <X className="size-3 text-destructive" />;
        if (message.isRead) return <CheckCheck className="size-3 text-primary" />;
        return <Check className="size-3 text-muted-foreground/60" />;
    };

    return (
        <div
            id={`message-${message.id}`}
            className={cn(
                'group flex items-end gap-3 max-w-[80%]',
                isMe && 'justify-end ml-auto',
                isSending && 'opacity-70',
            )}
        >
            {/* Partner avatar */}
            {!isMe && (
                <Link href={`/dashboard/artist/${partner.username}`} className="shrink-0">
                    <Image
                        src={getAvatarUrl(partner.avatar, partner.gender)}
                        alt={partner.username}
                        width={32}
                        height={32}
                        className="size-8 rounded-full bg-muted object-cover border border-primary/20"
                    />
                </Link>
            )}

            <div className={cn('flex flex-col gap-1 min-w-0', isMe && 'items-end')}>
                {/* Sender name for partner */}
                {!isMe && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">
                        {partner.username}
                    </p>
                )}

                {/* Message content */}
                <div className="relative">
                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                        <div
                            className={cn(
                                'grid gap-1 mb-1',
                                message.images.length === 1 && 'grid-cols-1 max-w-sm',
                                message.images.length === 2 && 'grid-cols-2 max-w-md',
                                message.images.length >= 3 && 'grid-cols-2 max-w-md',
                            )}
                        >
                            {message.images.map((img, i) => (
                                <div
                                    key={i}
                                    className="rounded-sm overflow-hidden border border-border bg-muted"
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Image ${i + 1}`}
                                        width={img.width || 300}
                                        height={img.height || 200}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Voice message */}
                    {message.voice && (
                        <div className="flex items-center gap-2 p-3 bg-muted/80 border border-border rounded-sm mb-1">
                            <div className="flex-1">
                                <p className="text-[10px] font-mono text-primary/60 uppercase">
                                    Voice message
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round(message.voice.duration)}s
                                </p>
                            </div>
                            <a
                                href={message.voice.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                            >
                                <Download className="size-4" />
                            </a>
                        </div>
                    )}

                    {/* File attachment */}
                    {message.file && (
                        <a
                            href={message.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-muted/80 border border-border rounded-sm mb-1 hover:border-primary/30 transition-colors"
                        >
                            <FileIcon className="size-5 text-primary/60 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">
                                    {message.file.fileName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {(message.file.fileSize / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <Download className="size-4 text-muted-foreground shrink-0" />
                        </a>
                    )}

                    {/* Text bubble */}
                    {isEditing ? (
                        <div className="space-y-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                className="w-full min-w-50 resize-none bg-muted/50 border border-primary/30 rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                                rows={2}
                                autoFocus
                            />
                            <div className="flex gap-1 justify-end">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(message.content);
                                    }}
                                    className="px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-2 py-0.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : message.content ? (
                        <div
                            className={cn(
                                'p-3 rounded-sm text-sm leading-relaxed',
                                isMe
                                    ? 'bg-primary/5 border border-primary/30 text-foreground'
                                    : 'bg-muted/80 border border-border text-foreground',
                            )}
                        >
                            {message.content}
                            {isEdited && (
                                <span className="text-[9px] text-muted-foreground/40 ml-2">
                                    (edited)
                                </span>
                            )}
                        </div>
                    ) : null}

                    {/* Actions overlay (hover) */}
                    <div
                        className={cn(
                            'absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10',
                            isMe ? 'left-0' : 'right-0',
                        )}
                    >
                        {/* Reaction button */}
                        <button
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
                                        {message.content && (
                                            <button
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setEditContent(message.content);
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
                                                setShowDeleteConfirm(true);
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
                </div>

                {/* Reactions display */}
                {renderReactions(message.reactions)}

                {/* Timestamp + status */}
                <div className={cn('flex items-center gap-1.5', isMe && 'flex-row-reverse')}>
                    <span
                        className="text-[9px] text-muted-foreground/40 font-mono"
                        title={formatDateTime(message.createdAt)}
                    >
                        {timeAgo(message.createdAt)}
                    </span>
                    {renderStatus()}
                </div>
            </div>

            {/* My avatar */}
            {isMe && currentUserAvatar && (
                <Image
                    src={currentUserAvatar}
                    alt="You"
                    width={32}
                    height={32}
                    className="size-8 rounded-full shrink-0 border border-primary/20 object-cover bg-muted"
                />
            )}

            {/* Delete confirmation */}
            <ConfirmPopup
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onDelete?.(message.id);
                    setShowDeleteConfirm(false);
                }}
                title="Delete message?"
                message="This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}
