'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TrustScoreCircle } from '@/components/messages';
import { useCurrentConversation } from '@/stores/chat-store';
import {
    useGetConversationMedia,
    useGetConversationFiles,
    useDeleteConversation,
} from '@/hooks/apis/message.api';
import { getAvatarUrl } from '@/utils/cloudinary';
import { timeAgo } from '@/utils/time';
import { ConfirmPopup } from '@/components/shared';
import { useState } from 'react';

interface UserInfoSidebarProps {
    onClose?: () => void;
}

export function UserInfoSidebar({ onClose }: UserInfoSidebarProps) {
    const conversation = useCurrentConversation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const deleteConversation = useDeleteConversation();
    const t = useTranslations('messages.UserInfoSidebar');

    const conversationId = conversation?.id;
    const partner = conversation?.partner;

    const { data: mediaData, isLoading: mediaLoading } = useGetConversationMedia(conversationId);
    const { data: filesData, isLoading: filesLoading } = useGetConversationFiles(conversationId);

    const mediaItems =
        mediaData?.pages
            .flatMap((p) => p.data)
            .flatMap((item) => item.data.map((img) => ({ ...item, image: img }))) ?? [];
    const fileItems = filesData?.pages.flatMap((p) => p.data) ?? [];

    if (!conversation || !partner) {
        return (
            <aside className="w-80 border-l border-border bg-background flex flex-col items-center justify-center p-6">
                <p className="text-xs text-muted-foreground/40 uppercase tracking-widest">
                    {t('noConversation')}
                </p>
            </aside>
        );
    }

    const handleDeleteConversation = () => {
        deleteConversation.mutate(conversation.id);
        setShowDeleteConfirm(false);
    };

    return (
        <aside className="w-80 border-l border-border bg-background flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase">
                    {t('metadata')}
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                {/* Partner info */}
                <div className="flex flex-col items-center mb-8">
                    <Link href={`/dashboard/artist/${partner.username}`}>
                        <Image
                            src={getAvatarUrl(partner.avatar, partner.gender)}
                            alt={partner.username}
                            width={80}
                            height={80}
                            className="size-20 rounded-full border-2 border-primary/30 object-cover bg-muted"
                        />
                    </Link>
                    <Link
                        href={`/dashboard/artist/${partner.username}`}
                        className="mt-3 text-sm font-black uppercase tracking-wider hover:text-primary transition-colors"
                    >
                        {partner.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">{partner.fullName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div
                            className={`size-2 rounded-full ${partner.isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
                        />
                        <span className="text-[10px] font-mono text-muted-foreground">
                            {partner.isOnline
                                ? t('online')
                                : partner.lastSeenAt
                                  ? t('lastSeen', { time: timeAgo(partner.lastSeenAt) })
                                  : t('offline')}
                        </span>
                    </div>
                </div>

                {/* Trust Score */}
                <div className="mb-8">
                    <TrustScoreCircle score={75} />
                </div>

                {/* Shared Media */}
                <div className="border-t border-border pt-6 mb-6">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-4">
                        {t('sharedMedia')}
                    </p>
                    {mediaLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="size-4 text-primary animate-spin" />
                        </div>
                    ) : mediaItems.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {mediaItems.slice(0, 9).map((item) => (
                                <div
                                    key={item.messageId + item.image.objectName}
                                    className="aspect-square bg-muted rounded border border-border overflow-hidden hover:border-primary cursor-pointer transition-all"
                                >
                                    <Image
                                        src={item.image.url}
                                        alt="Shared media"
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground/40 text-center py-4">
                            {t('noSharedMedia')}
                        </p>
                    )}
                </div>

                {/* Shared Files */}
                <div className="border-t border-border pt-6 mb-6">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-4">
                        {t('sharedFiles')}
                    </p>
                    {filesLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="size-4 text-primary animate-spin" />
                        </div>
                    ) : fileItems.length > 0 ? (
                        <div className="space-y-2">
                            {fileItems.slice(0, 5).map((item) => (
                                <a
                                    key={item.messageId + item.data.objectName}
                                    href={item.data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-sm hover:border-primary/30 transition-colors text-xs"
                                >
                                    <span className="truncate flex-1 font-bold">
                                        {item.data.fileName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {(item.data.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground/40 text-center py-4">
                            {t('noSharedFiles')}
                        </p>
                    )}
                </div>

                {/* Delete conversation */}
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-auto w-full py-3 border border-destructive/30 bg-destructive/5 text-destructive text-[10px] font-black uppercase tracking-[0.2em] hover:bg-destructive/20 transition-all"
                >
                    {t('deleteConversation')}
                </button>
            </div>

            <ConfirmPopup
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConversation}
                title={t('deleteConfirm.title')}
                message={t('deleteConfirm.message')}
                confirmText={t('deleteConfirm.confirmText')}
                type="danger"
            />
        </aside>
    );
}
