'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { MasonryItem } from '@/components/react-bits/Masonry';
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

// TODO: replace with API when available
const mockGalleryItems: MasonryItem[] = [
    {
        id: '1',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB1dXgysOdt3XiIJT4u4XJMyFbZtlctLZ5uKMLpeowAgRV_12MIkC0X90dFkMJXPpjOAgWTMiBbuvNJ1tUn2N4DVds3TE5BVg2e_rckoRU8wkATUr0OOcTX5g1TXnzeq2OvY_WwFwP4GmqUaQbblL8OjBNL7VGuzsODAATeJX76dQZxTkDgSzq0byojEZHB8Cd4V7SsR0oGJ9Zu0dx1WcuCH-bRgbxNXfzh-7bUVkyxlWNHkcOLKLCkTYWDF7_T0F68r8NP1GQPU4',
        url: '#',
        height: 700,
        title: 'Genesis_01',
        description: 'Featured cinematic cyberpunk urban photograph.',
        hash: '0x7F83B...1FC53',
        lat: '35.6895° N',
        lng: '139.6917° E',
        timestamp: '23:11 UTC',
    },
    {
        id: '2',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARnC3ET5jD5RUt99CtTV_7PwAKlV50pdLVHCnaLOUrn-HhMDX71Ai5Q9RCJfJFNadN0BX_0nZ2orbXOu_VynnnQS-Wbc9GuxJriDXjrLnOPRwtxB80bfS9M2Wp5mMi83vT9tphWgUIjd1M2CNwYeNNjiiB-Kwl_R4LDC9sMKRBZvAmNloHgxXpvYulfEHLBceSK3gn8Ptttt36cz8UaH3fEooQERTJwHjVNeSY-K-bLA3lVcMTzf1u3AOU-CPuqKrDfWIcVQgYPR8',
        url: '#',
        height: 650,
        title: 'Neon_Sign_V02',
        description: 'Vertical neon sign photography. Node 772 deployed.',
        hash: '0x4A92C...F7D21',
        lat: '37.7749° N',
        lng: '122.4194° W',
        timestamp: '08:22 UTC',
    },
    {
        id: '3',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzep5jeFokCax4ZMC4k5jtACqsJVAvyyhJx_YVLTR_zafGfMCU7epfEzHBhPtS3wiiwd2vAGTflyi1JlAhGKb3e5U0qjkzzjMAxOJNqm0zFPqyKlvfrOUn4HARKy-U-FlXQrV7E7aTiVZnV0B2iY1wHp4wgR4vXXDtOcp72hcrrhhDOY1fW4rQl2eGuukUaydVGEwSs4AM0wR0pfowQ3-DoEqnOpdYv5YXFYzuxQmz68Z2BxS7NOh76xnuNPciNGJR_amanc32JOo',
        url: '#',
        height: 680,
        title: 'Digital_City_03',
        description: 'Atmospheric digital cityscape. Data certified.',
        hash: '0x44928...E3F91',
        lat: '51.5074° N',
        lng: '0.1278° W',
        timestamp: '14:45 UTC',
    },
    {
        id: '4',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx8R3Dzux8XK-XULkF_feDkebpKYGenlzpk_fuEzA-HmRV9_7G5y6VHCOlm47j-Jqfp_Iua1g37g4Sg6TRxsj6dzxvStMCXl4XjYdF4LpMUT2_oWM1X0pst_7dB0EfKznsplzsfelMxkVHmtgQwBmwbNH1U0__StCeVjmTv5MqF80fReU-SU92hmIzwtsSDRJOs59GrGsf95iL4De9Itz8oULBSuW3IxRwYVuFvKdH5n8ZmjqD9KuRqjKT1WN8TfkVnrgjZSjDvSg',
        url: '#',
        height: 620,
        title: 'Night_Street_04',
        description: 'Long exposure night street. Licensed under BRIX v4.',
        hash: '0x8C3D1...A2B47',
        lat: '48.8566° N',
        lng: '2.3522° E',
        timestamp: '02:17 UTC',
    },
    {
        id: '5',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbotvS3VJ0f_owkl4BqHJyKs9vFmULYpLBDVCL0_7Skz2MTFSdMLz4vrnjgBrfNvg0Yq6XIpKi_FeRhtc_bOUUzdegbB0kEXM53-1VzGG1ZeMAB25VAgsKn4smhVf5VM98h8Xm2_Iv-dqml4mlfcarEl1gC21vcZAE3Nt4R9vXY_G3n8Jv-mAhyX9LNIeKgeTLmcmUXt359wp9zrOFWdCZT1BYNMEGxAz53JHim9NBJBheZL1V7egBHQ127tgNdr8sPQKTMs00T4',
        url: '#',
        height: 660,
        title: 'Grid_Texture_05',
        description: 'Abstract digital grid texture. Block 881922 verified.',
        hash: '0xD7F29...5E8C3',
        lat: '37.5665° N',
        lng: '126.9780° E',
        timestamp: '19:33 UTC',
    },
    {
        id: '6',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGwb_kLLtWNTDCTuQ4bTANWDEGf9B-C4cGojBJcBo0yk9GAXWcx6wJGuYjDo1zTOT-jbIjPmchXJD7z-2v-9vbyXbk6uokanYlsQg7LHYtmo1GS_d5YjPOgafOc2qTlxcEosfqUXcUDXGeK89bVrctZraYbML-xjTwHp_Lp2fHGxatNdDDqLYrXTvIItcQS1hnnXb6eTw_DAB9eGr3FTZE8NIXpLxKTksvp3VkTshj4o5camdS69uPp2sJVLlpyplu_XbRdQt0BcQ',
        url: '#',
        height: 700,
        title: 'Void_Structure_06',
        description: 'Neo-structuralist architecture captured.',
        hash: '0xA1B2C...3D4E5',
        lat: '34.0522° N',
        lng: '118.2437° W',
        timestamp: '11:08 UTC',
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
                onConnect={() => {
                    // TODO: implement connect / message
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

                {/* TODO: replace mockGalleryItems with API when available */}
                <ArtistGallery items={mockGalleryItems} />
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
