'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import type { BrickComment } from '@/types/brick.types';
import { cn } from '@/utils/classnames';
import { timeAgo } from '@/utils/time';
import { getAvatarUrl } from '@/utils/cloudinary';
import { useGetCommentVotes, useEditComment, useDeleteComment } from '@/hooks/apis/brick.api';
import { CommentVoteBar, CommentInput } from '@/components/brick-detail';
import { ConfirmPopup } from '@/components/shared';

interface CommentItemProps {
    comment: BrickComment;
    brickId: string;
    currentUserId?: string;
    depth?: number;
    onShowUpvoters: (commentId: string) => void;
}

export function CommentItem({
    comment,
    brickId,
    currentUserId,
    depth = 0,
    onShowUpvoters,
}: CommentItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);

    const { data: voteStatus } = useGetCommentVotes(comment.id);
    const editMutation = useEditComment();
    const deleteMutation = useDeleteComment();

    const isOwn = currentUserId === comment.user.id;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleSaveEdit = () => {
        const trimmed = editContent.trim();
        if (!trimmed) {
            setIsEditing(false);
            return;
        }
        setShowEditConfirm(true);
    };

    const confirmEdit = () => {
        const trimmed = editContent.trim();
        editMutation.mutate(
            { commentId: comment.id, content: trimmed },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    setShowEditConfirm(false);
                },
                onError: () => setShowEditConfirm(false),
            },
        );
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(
            { commentId: comment.id, brickId },
            {
                onSuccess: () => setShowDeleteConfirm(false),
                onError: () => setShowDeleteConfirm(false),
            },
        );
    };

    return (
        <div
            id={`comment-${comment.id}`}
            className={cn('group/comment', depth > 0 && 'ml-6 border-l border-primary/10 pl-3')}
        >
            <div className="flex gap-2.5 py-2.5">
                {/* Avatar */}
                <Link
                    href={`/dashboard/artist/${comment.user.username}`}
                    className="size-8 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0 mt-0.5 block"
                >
                    <Image
                        src={getAvatarUrl(comment.user.avatar, comment.user.gender)}
                        alt={comment.user.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                    />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/dashboard/artist/${comment.user.username}`}
                            className="text-xs font-bold truncate hover:text-primary transition-colors"
                        >
                            {comment.user.username}
                        </Link>

                        {/* Timestamp + edited + menu pushed to the right */}
                        <div className="flex items-center gap-1.5 ml-auto shrink-0">
                            <span className="text-[10px] text-muted-foreground/50">
                                {timeAgo(comment.createdAt)}
                                {comment.updatedAt !== comment.createdAt && (
                                    <span className="ml-0.5 italic">(edited)</span>
                                )}
                            </span>

                            {/* Menu button for own comments */}
                            {isOwn && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-0.5 opacity-0 group-hover/comment:opacity-100 text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer"
                                    >
                                        <MoreHorizontal className="size-3.5" />
                                    </button>
                                    {showMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-primary/20 rounded-md shadow-lg py-1 min-w-25">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-muted/50 cursor-pointer"
                                                >
                                                    <Pencil className="size-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleDelete();
                                                        setShowMenu(false);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-destructive/10 text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="size-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    {isEditing ? (
                        <div className="mt-1 space-y-1.5">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full resize-none bg-muted/50 border border-primary/10 rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/30"
                                rows={2}
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={editMutation.isPending}
                                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    className="text-[10px] text-muted-foreground hover:underline cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-foreground/90 mt-0.5 whitespace-pre-wrap wrap-break-word">
                            {comment.content}
                        </p>
                    )}

                    {/* Comment images */}
                    {comment.images && comment.images.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 overflow-x-auto scrollbar-none">
                            {comment.images.map((img) => (
                                <div
                                    key={img.publicId}
                                    className="relative shrink-0 h-20 rounded-sm overflow-hidden border border-primary/10"
                                    style={{ width: Math.round((img.width / img.height) * 80) }}
                                >
                                    <Image
                                        src={img.url}
                                        alt="Comment image"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions row */}
                    <div className="flex items-center gap-3 mt-1.5">
                        <CommentVoteBar
                            commentId={comment.id}
                            voteStatus={voteStatus}
                            onShowUpvoters={() => onShowUpvoters(comment.id)}
                        />

                        {/* Reply button (only for root comments, max depth = 1) */}
                        {depth === 0 && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={cn(
                                    'flex items-center gap-1 text-[10px] transition-colors cursor-pointer',
                                    isExpanded
                                        ? 'text-primary'
                                        : 'text-muted-foreground/60 hover:text-primary',
                                )}
                            >
                                <MessageCircle className="size-3" />
                                Reply
                            </button>
                        )}

                        {/* Show/hide replies toggle */}
                        {hasReplies && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors cursor-pointer"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="size-3" />
                                ) : (
                                    <ChevronDown className="size-3" />
                                )}
                                {comment.replyCount}{' '}
                                {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </button>
                        )}
                    </div>

                    {/* Nested replies */}
                    {isExpanded && hasReplies && (
                        <div className="mt-1">
                            {(comment.replies as unknown as BrickComment[]).map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    brickId={brickId}
                                    currentUserId={currentUserId}
                                    depth={depth + 1}
                                    onShowUpvoters={onShowUpvoters}
                                />
                            ))}
                        </div>
                    )}

                    {/* Reply input */}
                    {isExpanded && (
                        <div className="mt-2">
                            <CommentInput
                                brickId={brickId}
                                parentId={comment.id}
                                placeholder={`Reply to @${comment.user.username}...`}
                                autoFocus
                                onCancel={() => setIsExpanded(false)}
                                onSuccess={() => {
                                    // Keep expanded to show the new reply
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delete comment confirm popup */}
            <ConfirmPopup
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={deleteMutation.isPending}
            />

            {/* Edit comment confirm popup */}
            <ConfirmPopup
                isOpen={showEditConfirm}
                onClose={() => setShowEditConfirm(false)}
                onConfirm={confirmEdit}
                title="Save Changes"
                message="Are you sure you want to save the changes to your comment?"
                confirmText="Save"
                cancelText="Cancel"
                type="info"
                isLoading={editMutation.isPending}
            />
        </div>
    );
}
