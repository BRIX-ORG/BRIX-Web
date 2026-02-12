'use client';

import { FollowersModalContent } from './FollowersModalContent';

type ModalTab = 'followers' | 'following';

interface FollowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    idOrUsername: string;
    currentUserId?: string;
    initialTab?: ModalTab;
    followersCount: number;
    followingCount: number;
}

export function FollowersModal({
    isOpen,
    onClose,
    idOrUsername,
    currentUserId,
    initialTab = 'followers',
    followersCount,
    followingCount,
}: FollowersModalProps) {
    if (!isOpen) return null;

    // key ensures the inner component remounts when user changes
    return (
        <FollowersModalContent
            key={idOrUsername}
            onClose={onClose}
            idOrUsername={idOrUsername}
            currentUserId={currentUserId}
            initialTab={initialTab}
            followersCount={followersCount}
            followingCount={followingCount}
        />
    );
}
