'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, MapPin, Pencil, X } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { BrickDetail } from '@/types/brick.types';
import { timeAgo, formatDateTime } from '@/utils/time';
import { getAvatarUrl } from '@/utils/cloudinary';
import { formatCoord } from '@/utils/brick';
import { useUpdateBrick } from '@/hooks/apis/brick.api';
import { useToast } from '@/hooks/useToast';
import { updateBrickSchema } from '@/validations/brick';
import { ConfirmPopup } from '@/components/shared';

interface BrickInfoPanelProps {
    brick: BrickDetail;
    isOwner?: boolean;
}

export function BrickInfoPanel({ brick, isOwner = false }: BrickInfoPanelProps) {
    const toast = useToast();
    const updateBrickMutation = useUpdateBrick();

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const startEditing = () => {
        setEditTitle(brick.title);
        setEditDescription(brick.description ?? brick.generatedDescription ?? '');
        setEditIsPublic(brick.isPublic);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        const parsed = updateBrickSchema.safeParse({
            title: editTitle.trim(),
            description: editDescription.trim(),
            isPublic: editIsPublic,
        });
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
            toast.error(firstError);
            return;
        }
        setShowSaveConfirm(true);
    };

    const confirmSaveEdit = () => {
        const parsed = updateBrickSchema.safeParse({
            title: editTitle.trim(),
            description: editDescription.trim(),
            isPublic: editIsPublic,
        });
        if (!parsed.success) return;
        updateBrickMutation.mutate(
            {
                brickId: brick.id,
                data: parsed.data,
            },
            {
                onSuccess: () => {
                    toast.success('Brick updated successfully');
                    setIsEditing(false);
                    setShowSaveConfirm(false);
                },
                onError: () => {
                    toast.error('Failed to update brick');
                    setShowSaveConfirm(false);
                },
            },
        );
    };

    return (
        <div className="space-y-4 px-1">
            {/* Author row */}
            <div className="flex items-center gap-3">
                <Link
                    href={`/dashboard/artist/${brick.user.username}`}
                    className="size-10 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0 block"
                >
                    <Image
                        src={getAvatarUrl(brick.user.avatar, brick.user.gender)}
                        alt={brick.user.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/dashboard/artist/${brick.user.username}`}
                        className="text-sm font-bold truncate hover:text-primary transition-colors block"
                    >
                        {brick.user.username}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{brick.user.fullName}</p>
                </div>
                {isOwner && !isEditing && (
                    <button
                        type="button"
                        onClick={startEditing}
                        className="p-1 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer"
                        title="Edit brick"
                    >
                        <Pencil className="size-3.5" />
                    </button>
                )}
                <span
                    className="text-[10px] text-muted-foreground/60 font-mono shrink-0"
                    title={formatDateTime(brick.createdAt)}
                >
                    {timeAgo(brick.createdAt)}
                </span>
            </div>

            {/* Title & description */}
            {isEditing ? (
                <div className="space-y-2.5">
                    <div>
                        <label className="text-[8px] text-primary/60 uppercase font-bold mb-1 block">
                            Title
                        </label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            maxLength={100}
                            className="w-full bg-muted/50 border border-primary/20 rounded-sm px-2.5 py-1.5 text-sm font-bold text-foreground uppercase focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Brick title..."
                        />
                    </div>
                    <div>
                        <label className="text-[8px] text-primary/60 uppercase font-bold mb-1 block">
                            Description
                        </label>
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            maxLength={500}
                            rows={2}
                            className="w-full resize-none bg-muted/50 border border-primary/20 rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Description..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[8px] text-primary/60 uppercase font-bold">
                            Visibility
                        </label>
                        <button
                            type="button"
                            onClick={() => setEditIsPublic(!editIsPublic)}
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold transition-all cursor-pointer border',
                                editIsPublic
                                    ? 'bg-primary/20 text-primary border-primary/40'
                                    : 'bg-muted/50 text-muted-foreground border-border',
                            )}
                        >
                            {editIsPublic ? (
                                <>
                                    <Eye className="size-3" /> Public
                                </>
                            ) : (
                                <>
                                    <EyeOff className="size-3" /> Private
                                </>
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={updateBrickMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {updateBrickMutation.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={cancelEditing}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-all cursor-pointer"
                        >
                            <X className="size-3" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                        {brick.title}
                    </h2>
                    {(brick.description || brick.generatedDescription) && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                            {brick.description || brick.generatedDescription}
                        </p>
                    )}
                </div>
            )}

            {/* Coordinates grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/5 border border-primary/20 p-2 rounded-sm">
                    <p className="text-[8px] text-primary/60 uppercase font-bold">Latitude</p>
                    <p className="text-[10px] font-mono text-foreground truncate">
                        {formatCoord(brick.latitude, 'N', 'S')}
                    </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-2 rounded-sm">
                    <p className="text-[8px] text-primary/60 uppercase font-bold">Longitude</p>
                    <p className="text-[10px] font-mono text-foreground truncate">
                        {formatCoord(brick.longitude, 'E', 'W')}
                    </p>
                </div>
            </div>

            {/* Address */}
            {brick.address && brick.address !== 'string' && (
                <div className="flex items-start gap-1.5 bg-primary/5 border border-primary/20 p-2 rounded-sm">
                    <MapPin className="size-3.5 text-primary/60 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono text-foreground">{brick.address}</p>
                </div>
            )}

            {/* Metadata badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                    {brick.tagType}
                </span>
                <span className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                    {brick.mediaType}
                </span>
                {(isEditing ? editIsPublic : brick.isPublic) ? (
                    <span className="text-[10px] text-primary/60 font-mono">PUBLIC</span>
                ) : (
                    <span className="text-[10px] text-muted-foreground/60 font-mono">PRIVATE</span>
                )}
            </div>

            {/* Save edit confirm popup */}
            <ConfirmPopup
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSaveEdit}
                title="Save Changes"
                message="Are you sure you want to update this brick? Your changes will be visible to everyone."
                confirmText="Save"
                cancelText="Cancel"
                type="info"
                isLoading={updateBrickMutation.isPending}
            />
        </div>
    );
}
