'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import type { FollowUser } from '@/types/user.types';
import { useFollowUser, useUnfollowUser } from '@/hooks/apis/user.api';
import { getAvatarUrl } from '@/utils/cloudinary';

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
            {/* Avatar */}
            <div className="size-11 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0">
                <Image
                    src={getAvatarUrl(user.avatar, user.gender)}
                    alt={user.username}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.fullName}</p>
            </div>

            {/* Follow/Unfollow button (hidden for own row) */}
            {!isOwnRow && (
                <button
                    onClick={handleToggleFollow}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                        optimisticFollowing
                            ? 'bg-primary/10 border border-primary/40 text-primary hover:bg-destructive/20 hover:border-destructive/40 hover:text-destructive'
                            : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : optimisticFollowing ? (
                        <UserCheck className="size-3" />
                    ) : (
                        <UserPlus className="size-3" />
                    )}
                    {optimisticFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );
}
