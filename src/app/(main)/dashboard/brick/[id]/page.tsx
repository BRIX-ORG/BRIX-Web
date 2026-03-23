'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft,
    ArrowBigUp,
    ArrowBigDown,
    Loader2,
    MapPin,
    MessageCircle,
    Eye,
    EyeOff,
    Pencil,
    X,
} from 'lucide-react';
import { cn } from '@/utils/classnames';
import { timeAgo, formatDateTime } from '@/utils/time';
import { formatCoord } from '@/utils/brick';
import { getAvatarUrl } from '@/utils/cloudinary';
import { useToast } from '@/hooks/useToast';
import {
    useGetBrickDetail,
    useGetBrickVotes,
    useVoteBrick,
    useUpdateBrick,
} from '@/hooks/apis/brick.api';
import type { BrickVoteStatus } from '@/types/brick.types';
import { updateBrickSchema } from '@/validations/brick';
import {
    BrickMediaViewer,
    CommentSection,
    UpvotersModal,
    ShareButton,
    OnchainPanel,
} from '@/components/brick-detail';
import { ConfirmPopup } from '@/components/shared';
import { Map, MapMarker, MarkerContent, MapControls } from '@/components/ui/Map';
import { useOnchainSocket } from '@/hooks/useOnchainSocket';

export default function BrickPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const toast = useToast();

    const { data: brick, isLoading } = useGetBrickDetail(id);
    const { data: voteStatus } = useGetBrickVotes(id);

    // Socket hook dể update React Query runtime khi có event
    useOnchainSocket(id);

    const isOwner = !!currentUserId && currentUserId === brick?.user?.id;

    const [showUpvoters, setShowUpvoters] = useState(false);

    // Edit mode (owner only)
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const updateBrickMutation = useUpdateBrick();

    const startEditing = () => {
        if (!brick) return;
        setEditTitle(brick.title);
        setEditDescription(brick.description ?? brick.generatedDescription ?? '');
        setEditIsPublic(brick.isPublic);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        if (!brick || !id) return;
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
        if (!id) return;
        const parsed = updateBrickSchema.safeParse({
            title: editTitle.trim(),
            description: editDescription.trim(),
            isPublic: editIsPublic,
        });
        if (!parsed.success) return;
        updateBrickMutation.mutate(
            {
                brickId: id,
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

    // Vote logic
    const voteMutation = useVoteBrick();
    const [optimistic, setOptimistic] = useState<BrickVoteStatus | null>(null);

    // Reset optimistic when voteStatus changes from server (adjust state during render)
    const [prevVoteStatus, setPrevVoteStatus] = useState(voteStatus);
    if (voteStatus !== prevVoteStatus) {
        setPrevVoteStatus(voteStatus);
        if (optimistic !== null) {
            setOptimistic(null);
        }
    }

    const current = optimistic ?? voteStatus;
    const userVote = current?.userVote ?? null;
    const upvotes = current?.upvoteCount ?? 0;
    const downvotes = current?.downvoteCount ?? 0;
    const score = current?.score ?? 0;

    const handleVote = (value: 1 | -1) => {
        if (!current || !id) return;

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
            { brickId: id, value },
            {
                onSuccess: (data) => setOptimistic(data),
                onError: () => setOptimistic(null),
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="size-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!brick) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-sm text-muted-foreground font-mono">Brick not found</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-xs text-primary hover:underline cursor-pointer"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Top bar */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    {isOwner && !isEditing && (
                        <button
                            type="button"
                            onClick={startEditing}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            <Pencil className="size-3" />
                            Edit
                        </button>
                    )}
                    {(isEditing ? editIsPublic : brick.isPublic) ? (
                        <span className="flex items-center gap-1 text-[10px] text-primary/60 font-mono">
                            <Eye className="size-3" />
                            PUBLIC
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono">
                            <EyeOff className="size-3" />
                            PRIVATE
                        </span>
                    )}
                    <span className="bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                        {brick.tagType}
                    </span>
                    <span className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                        {brick.mediaType}
                    </span>
                    {brick.tagType === 'REALTIME' && (
                        <span
                            className={cn(
                                'px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider border',
                                brick.metadata?.verifiedAt
                                    ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_8px_rgba(0,238,255,0.2)]'
                                    : 'bg-red-500/10 border-red-500/40 text-red-400',
                            )}
                        >
                            {brick.metadata?.verifiedAt ? '● VERIFIED' : '○ UNVERIFIED'}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column: Media (3/5) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-background/80 border border-primary/20 rounded-xl overflow-hidden">
                        <div className="p-4">
                            <BrickMediaViewer brick={brick} isOwner={isOwner} />
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="bg-background/80 border border-primary/20 rounded-xl p-5 space-y-4">
                        {/* Author row */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/dashboard/artist/${brick.user.username}`}
                                className="size-11 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0 block"
                            >
                                <Image
                                    src={getAvatarUrl(brick.user.avatar, brick.user.gender)}
                                    alt={brick.user.username}
                                    width={44}
                                    height={44}
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
                                <p className="text-xs text-muted-foreground truncate">
                                    {brick.user.fullName}
                                </p>
                            </div>
                            <span
                                className="text-[10px] text-muted-foreground/60 font-mono shrink-0"
                                title={formatDateTime(brick.createdAt)}
                            >
                                {timeAgo(brick.createdAt)}
                                {brick.updatedAt !== brick.createdAt && (
                                    <span
                                        className="ml-1 italic"
                                        title={`Edited ${formatDateTime(brick.updatedAt)}`}
                                    >
                                        (edited)
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Title & Description */}
                        {isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-primary/60 uppercase font-bold mb-1 block">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        maxLength={100}
                                        className="w-full bg-muted/50 border border-primary/20 rounded-sm px-3 py-2 text-sm font-bold text-foreground uppercase focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Brick title..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-primary/60 uppercase font-bold mb-1 block">
                                        Description
                                    </label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="w-full resize-none bg-muted/50 border border-primary/20 rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Description..."
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] text-primary/60 uppercase font-bold">
                                        Visibility
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setEditIsPublic(!editIsPublic)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-bold transition-all cursor-pointer border',
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
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        disabled={updateBrickMutation.isPending}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {updateBrickMutation.isPending && (
                                            <Loader2 className="size-3 animate-spin" />
                                        )}
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-all cursor-pointer"
                                    >
                                        <X className="size-3" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
                                    {brick.title}
                                </h1>
                                {(brick.description || brick.generatedDescription) && (
                                    <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                                        {brick.description || brick.generatedDescription}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Location */}
                        {(brick.latitude || brick.longitude || brick.address) && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-primary/5 border border-primary/20 p-2.5 rounded-sm">
                                        <p className="text-[8px] text-primary/60 uppercase font-bold">
                                            Latitude
                                        </p>
                                        <p className="text-[11px] font-mono text-foreground truncate">
                                            {formatCoord(brick.latitude, 'N', 'S')}
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 p-2.5 rounded-sm">
                                        <p className="text-[8px] text-primary/60 uppercase font-bold">
                                            Longitude
                                        </p>
                                        <p className="text-[11px] font-mono text-foreground truncate">
                                            {formatCoord(brick.longitude, 'E', 'W')}
                                        </p>
                                    </div>
                                </div>
                                {brick.address && brick.address !== 'string' && (
                                    <div className="flex items-start gap-1.5 bg-primary/5 border border-primary/20 p-2.5 rounded-sm">
                                        <MapPin className="size-3.5 text-primary/60 shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-mono text-foreground">
                                            {brick.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verification status (REALTIME only) */}
                        {brick.tagType === 'REALTIME' && (
                            <div
                                className={cn(
                                    'border p-3 space-y-2',
                                    brick.metadata?.verifiedAt
                                        ? 'border-primary/30 bg-primary/5'
                                        : 'border-red-500/30 bg-red-500/5',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'size-2 rounded-full',
                                            brick.metadata?.verifiedAt
                                                ? 'bg-primary shadow-[0_0_6px_rgba(0,238,255,0.6)] animate-pulse'
                                                : 'bg-red-500/80',
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-[10px] font-bold font-mono uppercase tracking-widest',
                                            brick.metadata?.verifiedAt
                                                ? 'text-primary'
                                                : 'text-red-400',
                                        )}
                                    >
                                        {brick.metadata?.verifiedAt
                                            ? 'VERIFICATION PASSED'
                                            : 'VERIFICATION FAILED'}
                                    </span>
                                </div>
                                {brick.metadata?.verifiedAt && (
                                    <p className="text-[9px] font-mono text-muted-foreground/60">
                                        VERIFIED_AT: {brick.metadata.verifiedAt}
                                    </p>
                                )}
                                {brick.metadata?.hashSha256 && (
                                    <p className="text-[9px] font-mono text-muted-foreground/60 truncate">
                                        SHA256: {brick.metadata.hashSha256}
                                    </p>
                                )}
                                {brick.metadata?.onChainTx && (
                                    <p className="text-[9px] font-mono text-muted-foreground/60 truncate">
                                        ON_CHAIN_TX: {brick.metadata.onChainTx}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Render OnchainPanel for REALTIME bricks (both owners + viewers) */}
                        {brick.tagType === 'REALTIME' && brick.metadata?.verifiedAt && (
                            <OnchainPanel brick={brick} isOwner={isOwner} />
                        )}

                        {/* Vote bar + Share */}
                        <div className="flex items-center gap-3 border-t border-primary/10 pt-4">
                            {/* Upvote */}
                            <button
                                type="button"
                                onClick={() => handleVote(1)}
                                disabled={voteMutation.isPending}
                                className={cn(
                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-sm transition-all cursor-pointer',
                                    'text-xs font-bold uppercase tracking-wider',
                                    userVote === 1
                                        ? 'bg-primary/20 text-primary border border-primary/40'
                                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent',
                                )}
                            >
                                {voteMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ArrowBigUp
                                        className="size-4"
                                        fill={userVote === 1 ? 'currentColor' : 'none'}
                                    />
                                )}
                                <span>{upvotes}</span>
                            </button>

                            {/* Score – click to view upvoters */}
                            <button
                                type="button"
                                onClick={() => setShowUpvoters(true)}
                                className={cn(
                                    'text-sm font-mono font-bold px-2 py-0.5 rounded-sm transition-colors hover:underline cursor-pointer',
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
                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-sm transition-all cursor-pointer',
                                    'text-xs font-bold uppercase tracking-wider',
                                    userVote === -1
                                        ? 'bg-destructive/20 text-destructive border border-destructive/40'
                                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent',
                                )}
                            >
                                <ArrowBigDown
                                    className="size-4"
                                    fill={userVote === -1 ? 'currentColor' : 'none'}
                                />
                                <span>{downvotes}</span>
                            </button>

                            <div className="flex-1" />

                            {/* Share */}
                            <ShareButton brickId={brick.id} />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 font-mono">
                            <span>{brick._count.votes} votes</span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="size-3" />
                                {brick._count.comments} comments
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right column: Comments + Map (2/5) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Comments */}
                    <div className="bg-background/80 border border-primary/20 rounded-xl overflow-hidden">
                        <div className="h-[calc(100vh-12rem)] min-h-80 flex flex-col">
                            <CommentSection
                                brickId={brick.id}
                                totalComments={brick._count.comments}
                                currentUserId={currentUserId}
                            />
                        </div>
                    </div>

                    {/* Interactive Map */}
                    {brick.latitude != null && brick.longitude != null && (
                        <div className="bg-background/80 border border-primary/20 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10">
                                <MapPin className="size-4 text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">
                                    Location
                                </h3>
                            </div>
                            <div className="relative w-full h-64">
                                <Map
                                    center={[brick.longitude, brick.latitude]}
                                    zoom={13}
                                    theme="dark"
                                    attributionControl={false}
                                    dragPan
                                    scrollZoom
                                    dragRotate={false}
                                    touchZoomRotate
                                >
                                    <MapMarker
                                        longitude={brick.longitude}
                                        latitude={brick.latitude}
                                    >
                                        <MarkerContent>
                                            <div className="size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(0,238,255,0.5)] flex items-center justify-center">
                                                <div className="size-1.5 rounded-full bg-background" />
                                            </div>
                                        </MarkerContent>
                                    </MapMarker>
                                    <MapControls position="bottom-right" showZoom />
                                </Map>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upvoters modal */}
            <UpvotersModal
                isOpen={showUpvoters}
                onClose={() => setShowUpvoters(false)}
                targetId={id ?? ''}
                type="brick"
            />

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
