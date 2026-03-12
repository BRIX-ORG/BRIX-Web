'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, UserMinus, Star, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/utils/classnames';
import {
    getAvatarUrl,
    getCloudinaryAvatar,
    getBackgroundUrl,
    getCloudinaryBanner,
} from '@/utils/cloudinary';
import { useFollowUser, useUnfollowUser } from '@/hooks/apis/user.api';
import type { TopAuthor, TopUser, FollowUser } from '@/types/user.types';

interface UserCardProps {
    user: TopAuthor | TopUser | FollowUser;
    className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    // Type guards/checks
    const totalVotes = (user as TopAuthor).totalVotes;
    const totalFollowers = user.totalFollowers;
    const isFollowing = user.isFollowing;

    // Get background
    const hasBackground = !!user.background;
    const backgroundUrl = hasBackground
        ? getCloudinaryBanner(getBackgroundUrl(user.background), 400, '16:9')
        : null;

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFollowing) {
            unfollowMutation.mutate(user.id);
        } else {
            followMutation.mutate(user.id);
        }
    };

    const isActionLoading = followMutation.isPending || unfollowMutation.isPending;

    return (
        <Link
            href={`/dashboard/artist/${user.username}`}
            className={cn(
                'group relative flex flex-col rounded-2xl border transition-all duration-500',
                'bg-background/40 border-primary/10 hover:border-primary/30',
                'backdrop-blur-xl overflow-hidden min-w-[260px] max-w-[300px]',
                'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(0,238,255,0.1)]',
                'hover:-translate-y-1',
                className,
            )}
        >
            {/* Header / Background Cover */}
            <div
                className={cn(
                    'relative h-24 w-full overflow-hidden',
                    !hasBackground && 'cyber-grid bg-primary/5',
                )}
            >
                {hasBackground && (
                    <Image
                        src={backgroundUrl!}
                        alt="Cover"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col px-5 pb-6 -mt-10">
                {/* Avatar Section */}
                <div className="flex items-end justify-between mb-4">
                    <div className="relative group/avatar">
                        <div className="absolute -inset-1 bg-linear-to-br from-primary via-purple-500 to-blue-500 rounded-2xl opacity-40 group-hover/avatar:opacity-100 blur-sm transition duration-500" />
                        <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-background bg-muted shadow-2xl">
                            <Image
                                src={getCloudinaryAvatar(
                                    getAvatarUrl(user.avatar, user.gender),
                                    160,
                                )}
                                alt={user.username}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="flex flex-col items-end gap-1">
                        {totalVotes !== undefined && (
                            <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5 backdrop-blur-md">
                                <Star className="size-3 text-primary fill-primary/20" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {totalVotes} BRIX
                                </span>
                            </div>
                        )}
                        {totalFollowers !== undefined && (
                            <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-md">
                                <UsersIcon className="size-3 text-purple-400 fill-purple-400/20" />
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                                    {totalFollowers} FLWS
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="space-y-1 mb-5">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                            {user.fullName}
                        </h4>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground/60 tracking-tight">
                        @{user.username}
                    </p>
                </div>

                {/* Description / Bio */}
                <div className="h-10 mb-6">
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed italic">
                        {user.shortDescription || 'No bio available...'}
                    </p>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFollowToggle}
                        disabled={isActionLoading}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300',
                            isFollowing
                                ? 'bg-primary/5 border border-primary/20 text-primary hover:bg-primary/15'
                                : 'bg-primary text-background hover:shadow-[0_0_25px_rgba(0,238,255,0.45)] active:scale-95',
                        )}
                    >
                        {isActionLoading ? (
                            <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isFollowing ? (
                            <>
                                <UserMinus className="size-3.5" />
                                Unfollow
                            </>
                        ) : (
                            <>
                                <UserPlus className="size-3.5" />
                                Follow
                            </>
                        )}
                    </button>

                    <div className="size-10 rounded-xl bg-background/50 border border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                        <UsersIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </div>

            {/* Glowing Border Animation on Hover */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(0,238,255,0.5)]" />
        </Link>
    );
}
