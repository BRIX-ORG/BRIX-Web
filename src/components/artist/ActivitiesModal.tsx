'use client';

import { ActivitiesModalContent } from '@/components/artist/ActivitiesModalContent';

interface ActivitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    idOrUsername: string;
}

export function ActivitiesModal({ isOpen, onClose, idOrUsername }: ActivitiesModalProps) {
    if (!isOpen) return null;

    return (
        <ActivitiesModalContent key={idOrUsername} onClose={onClose} idOrUsername={idOrUsername} />
    );
}
