'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import type { FollowUser } from '@/types/user.types';
import { useFollowUser, useUnfollowUser } from '@/hooks/apis/user.api';
import { getAvatarUrl } from '@/utils/cloudinary';
import Link from 'next/link';
import { cn } from '@/utils/classnames';

interface FollowUserItemProps {
    user: FollowUser;
    currentUserId?: string;
}

export function FollowUserItem({ user, currentUserId }: FollowUserItemProps) {
    const isOwnRow = currentUserId === user.id;
    const [optimisticFollowing, setOptimisticFollowing] = useState(user.isFollowing);

    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    const handleToggleFollow = () => {
        if (optimisticFollowing) {
            setOptimisticFollowing(false);
            unfollowMutation.mutate(user.id, {
                onError: () => setOptimisticFollowing(true),
            });
        } else {
            setOptimisticFollowing(true);
            followMutation.mutate(user.id, {
                onError: () => setOptimisticFollowing(false),
            });
        }
    };

    return (
        <div className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
            {/* Avatar & Info */}
            <Link
                href={`/dashboard/artist/${user.username}`}
                className="flex items-center gap-3 flex-1 min-w-0 group"
            >
                <div className="size-11 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0 group-hover:border-primary/50 transition-colors">
                    <Image
                        src={getAvatarUrl(user.avatar, user.gender)}
                        alt={user.username}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.fullName}</p>
                </div>
            </Link>

            {/* Follow/Unfollow button (hidden for own row) */}
            {!isOwnRow && (
                <button
                    onClick={handleToggleFollow}
                    disabled={isLoading}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-sm font-bold uppercase text-xs transition-all cursor-pointer disabled:opacity-50',
                        optimisticFollowing
                            ? 'bg-primary/5 border border-primary/20 text-primary/80 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive hover:shadow-[0_0_15px_rgba(255,68,68,0.2)]'
                            : 'bg-linear-to-r from-secondary to-primary text-primary-foreground shadow-[0_0_15px_rgba(0,238,255,0.3)] hover:shadow-[0_0_30px_rgba(0,238,255,0.5)] hover:opacity-90',
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : optimisticFollowing ? (
                        <UserCheck className="size-4" />
                    ) : (
                        <UserPlus className="size-4" />
                    )}
                    {optimisticFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );
}
