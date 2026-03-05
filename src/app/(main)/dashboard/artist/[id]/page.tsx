'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/stores/ui-store';
import type { ApiResponse } from '@/types/auth.types';
import type { FollowActionResponse } from '@/types/user.types';
import {
    ArtistHeroSection,
    ArtistStatsGrid,
    ArtistSidebar,
    ArtistGallery,
    ArtistData,
    ArtistStats,
    ActivityItem,
    FollowersModal,
} from '@/components/artist';
import {
    useGetUser,
    useGetFollowers,
    useFollowUser,
    useUnfollowUser,
    useGetFollowing,
    useCheckFollow,
} from '@/hooks/apis/user.api';
import { getConversationByPartner } from '@/hooks/apis/message.api';
import { useChatStore } from '@/stores/chat-store';

// ─── Mock data for sections without API yet ────────────────────────

const mockStats: ArtistStats = {
    digitalAssets: 42804,
    assetsGrowth: '+12.4%',
    validated: 1209,
    rank: 14,
    rankPercentile: 'Top 1%',
};

// TODO: replace with API when available
const mockActivity: ActivityItem[] = [
    {
        id: '1',
        type: 'mint',
        code: 'MINTED_0X2938',
        description: 'Asset "Neon_Void_04" deployed to BRIX layer 2.',
        time: '2m ago',
    },
    {
        id: '2',
        type: 'transfer',
        code: 'TRANSFER_READY',
        description: 'Licensing rights transferred to @VEX_CORP.',
        time: '45m ago',
    },
    {
        id: '3',
        type: 'verify',
        code: 'VERIFICATION_PASS',
        description: 'New geolocation data verified for Batch #19.',
        time: '4h ago',
    },
];

// ─── Default avatar for users without one ──────────────────────────
const SIDEBAR_FOLLOWERS_LIMIT = 12;

export default function ArtistProfilePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    // ─── Fetch profile user ────────────────────────────────
    const { data: profileUser, isLoading: isProfileLoading, isError } = useGetUser(id);

    // ─── Check own profile ─────────────────────────────────
    const isOwnProfile = !!(session?.user && profileUser && session.user.id === profileUser.id);

    // ─── Followers for sidebar ─────────────────────────────
    const { data: followersData } = useGetFollowers(id, SIDEBAR_FOLLOWERS_LIMIT);
    const sidebarFollowers = followersData?.data ?? [];
    const totalFollowers = followersData?.total ?? 0;

    // ─── Following count (fetch first page just for total) ─
    const { data: followingData } = useGetFollowing(id, 1);
    const totalFollowing = followingData?.total ?? 0;

    // ─── Follow status check ───────────────────────────────
    const queryClient = useQueryClient();
    const profileUserId = isOwnProfile ? undefined : profileUser?.id;
    const { data: followStatus } = useCheckFollow(profileUserId);
    const isFollowing = followStatus?.isFollowing ?? false;

    // ─── Follow / Unfollow (optimistic cache update) ───────
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

    const setOptimisticFollow = (value: boolean) => {
        queryClient.setQueryData<ApiResponse<FollowActionResponse>['data']>(
            ['followStatus', profileUser?.id],
            { isFollowing: value },
        );
    };

    const handleFollow = () => {
        if (!profileUser) return;
        setOptimisticFollow(true);
        followMutation.mutate(profileUser.id, {
            onError: () => setOptimisticFollow(false),
        });
    };

    const handleUnfollow = () => {
        if (!profileUser) return;
        setOptimisticFollow(false);
        unfollowMutation.mutate(profileUser.id, {
            onError: () => setOptimisticFollow(true),
        });
    };

    // ─── Followers / Following modal ───────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');

    const openFollowersModal = () => {
        setModalTab('followers');
        setShowModal(true);
    };

    const openFollowingModal = () => {
        setModalTab('following');
        setShowModal(true);
    };

    // ─── Loading state ─────────────────────────────────────
    useEffect(() => {
        if (isProfileLoading) {
            showLoading('Loading profile...');
        } else {
            hideLoading();
        }
    }, [isProfileLoading, showLoading, hideLoading]);

    // ─── Error state → 404 ──────────────────────────────────
    if (isError && !isProfileLoading) {
        notFound();
    }

    if (isProfileLoading || !profileUser) {
        return null;
    }

    // ─── Map User → ArtistData ─────────────────────────────
    const artistData: ArtistData = {
        id: profileUser.id,
        username: profileUser.username,
        fullName: profileUser.fullName,
        tagline: profileUser.shortDescription || `${profileUser.role} / BRIX Network`,
        avatar: profileUser.avatar,
        gender: profileUser.gender,
        background: profileUser.background?.url ?? null,
        trustScore: profileUser.trustScore,
        verifiedAt: profileUser.verifiedAt,
        followersCount: totalFollowers,
        followingCount: totalFollowing,
    };

    // ─── Parse user address for map ────────────────────────
    const userAddress = profileUser.address;
    const lat = userAddress ? parseFloat(userAddress.lat) : NaN;
    const lng = userAddress ? parseFloat(userAddress.lon) : NaN;
    const hasValidLocation = !isNaN(lat) && !isNaN(lng);

    return (
        <div className="relative p-8 max-w-360 mx-auto space-y-8">
            <ArtistHeroSection
                artist={artistData}
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                isFollowLoading={isFollowLoading}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onChat={async () => {
                    if (!profileUser || isOwnProfile) return;

                    // Check if a conversation already exists with this user
                    const existing = await getConversationByPartner(profileUser.id);

                    if (existing) {
                        // Existing conversation → select it and navigate
                        useChatStore.getState().setCurrentConversation(existing.id);
                    } else {
                        // No conversation yet → create a temporary one client-side
                        // Backend will create the real conversation on first message
                        useChatStore.getState().upsertConversation({
                            id: profileUser.id,
                            partner: {
                                id: profileUser.id,
                                username: profileUser.username,
                                fullName: profileUser.fullName,
                                avatar: profileUser.avatar,
                                gender: profileUser.gender,
                                isOnline: false,
                                lastSeenAt: null,
                            },
                            lastMessage: null,
                            unreadCount: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                        useChatStore.getState().setCurrentConversation(profileUser.id);
                    }

                    router.push('/messages');
                }}
                onEditProfile={() => router.push('/dashboard/settings')}
                onFollowersClick={openFollowersModal}
                onFollowingClick={openFollowingModal}
            />

            {/* TODO: replace mockStats with API when available */}
            <ArtistStatsGrid stats={mockStats} />

            <div className="grid grid-cols-12 gap-8">
                <ArtistSidebar
                    activities={mockActivity}
                    followers={sidebarFollowers}
                    totalFollowers={totalFollowers}
                    onViewAllFollowers={openFollowersModal}
                    location={
                        hasValidLocation
                            ? { lat, lng, displayName: userAddress?.displayName ?? '' }
                            : undefined
                    }
                />

                <ArtistGallery idOrUsername={id} />
            </div>

            {/* Followers / Following Modal */}
            <FollowersModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                idOrUsername={id}
                currentUserId={session?.user?.id}
                initialTab={modalTab}
                followersCount={totalFollowers}
                followingCount={totalFollowing}
            />
        </div>
    );
}
