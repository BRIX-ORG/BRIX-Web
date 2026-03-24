'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { X, Loader2 } from 'lucide-react';
import type { BrickUpvoter } from '@/types/brick.types';
import { useGetBrickUpvoters, useGetCommentUpvoters } from '@/hooks/apis/brick.api';
import { getAvatarUrl } from '@/utils/cloudinary';

interface UpvotersModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pass brickId for brick upvoters, commentId for comment upvoters */
    targetId: string;
    type: 'brick' | 'comment';
}

function UpvoterRow({ upvoter }: { upvoter: BrickUpvoter }) {
    return (
        <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/50 transition-colors">
            <Link
                href={`/dashboard/artist/${upvoter.username}`}
                className="size-9 rounded-full border border-primary/20 overflow-hidden bg-muted shrink-0 block"
            >
                <Image
                    src={getAvatarUrl(upvoter.avatar, upvoter.gender)}
                    alt={upvoter.username}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                />
            </Link>
            <div className="flex-1 min-w-0">
                <Link
                    href={`/dashboard/artist/${upvoter.username}`}
                    className="text-sm font-bold truncate hover:text-primary transition-colors block"
                >
                    {upvoter.username}
                </Link>
                <p className="text-xs text-muted-foreground truncate">{upvoter.fullName}</p>
            </div>
        </div>
    );
}

export function UpvotersModal({ isOpen, onClose, targetId, type }: UpvotersModalProps) {
    const t = useTranslations('onchain.upvoters');
    const brickQuery = useGetBrickUpvoters(type === 'brick' && isOpen ? targetId : undefined);
    const commentQuery = useGetCommentUpvoters(type === 'comment' && isOpen ? targetId : undefined);

    const upvoters = type === 'brick' ? brickQuery.data : commentQuery.data;
    const isLoading = type === 'brick' ? brickQuery.isLoading : commentQuery.isLoading;

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-background border border-primary/20 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,238,255,0.1)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10">
                    <h3 className="text-xs font-bold uppercase tracking-widest">{t('title')}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="size-5 animate-spin text-primary" />
                        </div>
                    ) : !upvoters || upvoters.length === 0 ? (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-sm text-muted-foreground font-mono">{t('empty')}</p>
                        </div>
                    ) : (
                        upvoters.map((u) => <UpvoterRow key={u.id} upvoter={u} />)
                    )}
                </div>
            </div>
        </div>
    );
}
