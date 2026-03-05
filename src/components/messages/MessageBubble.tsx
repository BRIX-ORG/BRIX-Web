'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, CheckCheck, Clock, FileIcon, Download, X } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { timeAgo, formatDateTime } from '@/utils/time';
import type { Message } from '@/types/message.types';
import { getAvatarUrl } from '@/utils/cloudinary';
import type { ConversationPartner } from '@/types/message.types';
import { ConfirmPopup } from '@/components/shared';
import {
    VoicePlayer,
    ImageLightbox,
    MessageReactionsDisplay,
    MessageActions,
} from '@/components/messages';

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    partner: ConversationPartner;
    currentUserId?: string;
    currentUserAvatar?: string;
    onReaction?: (messageId: string, emoji: string) => void;
    onEdit?: (messageId: string, content: string) => void;
    onDelete?: (messageId: string) => void;
}

export function MessageBubble({
    message,
    isMe,
    partner,
    currentUserId,
    currentUserAvatar,
    onReaction,
    onEdit,
    onDelete,
}: MessageBubbleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const isSending = message._status === 'sending';
    const isFailed = message._status === 'failed';
    const isEdited = message._isEdited === true;

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
                {!isMe && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">
                        {partner.username}
                    </p>
                )}

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
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setLightboxImage(img.url)}
                                    className="rounded-sm overflow-hidden border border-border bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Image ${i + 1}`}
                                        width={img.width || 300}
                                        height={img.height || 200}
                                        className="w-full h-auto object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Voice message */}
                    {message.voice && <VoicePlayer voice={message.voice} isMe={isMe} />}

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
                        </div>
                    ) : null}

                    {/* Hover actions: reaction picker + edit/delete menu */}
                    <MessageActions
                        isMe={isMe}
                        isSending={isSending}
                        hasContent={!!message.content}
                        onReaction={(emoji) => onReaction?.(message.id, emoji)}
                        onEdit={() => {
                            setIsEditing(true);
                            setEditContent(message.content);
                        }}
                        onDelete={() => setShowDeleteConfirm(true)}
                    />
                </div>

                {/* Reactions display */}
                <MessageReactionsDisplay
                    reactions={message.reactions}
                    isMe={isMe}
                    currentUserId={currentUserId}
                    partnerName={partner.fullName || partner.username}
                    onToggle={(emoji) => onReaction?.(message.id, emoji)}
                />

                {/* Timestamp + status */}
                <div className={cn('flex items-center gap-1.5', isMe && 'flex-row-reverse')}>
                    <span
                        className="text-[9px] text-muted-foreground/40 font-mono"
                        title={formatDateTime(message.createdAt)}
                    >
                        {timeAgo(message.createdAt)}
                    </span>
                    {isEdited && (
                        <span className="text-[9px] text-muted-foreground/40 italic">edited</span>
                    )}
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

            {/* Image Lightbox */}
            {lightboxImage && (
                <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
            )}
        </div>
    );
}
