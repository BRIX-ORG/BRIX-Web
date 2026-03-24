'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Link2, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/classnames';
import { useGetConversations, useSendMessage } from '@/hooks/apis/message.api';
import { getAvatarUrl } from '@/utils/cloudinary';
import type { Conversation } from '@/types/message.types';

interface ShareBrickModalProps {
    brickId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareBrickModal({ brickId, isOpen, onClose }: ShareBrickModalProps) {
    const t = useTranslations('landing.share'); // Adjust namespace if needed, using landing mapping for now based on file path injection
    const tShare = useTranslations('onchain.share'); // For copy link strings we reuse
    const toast = useToast();

    // Copy Link state
    const [copied, setCopied] = useState(false);
    const shareUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/dashboard/brick/${brickId}` : '';

    // Message state
    const { data: conversationsResponse, isLoading: isLoadingConversations } =
        useGetConversations(50);
    const conversations = useMemo(
        () => conversationsResponse?.pages.flatMap((page) => page.data) || [],
        [conversationsResponse],
    );
    const sendMessageMutation = useSendMessage();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [sentUsers, setSentUsers] = useState<Record<string, boolean>>({});

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const lowerQ = searchQuery.toLowerCase();
        return conversations.filter(
            (c: Conversation) =>
                c.partner.fullName.toLowerCase().includes(lowerQ) ||
                c.partner.username.toLowerCase().includes(lowerQ),
        );
    }, [conversations, searchQuery]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success(tShare('toast.success'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(tShare('toast.error'));
        }
    };

    const handleSend = async (userId: string) => {
        if (!userId) return;

        try {
            await sendMessageMutation.mutateAsync({
                receiverId: userId,
                content: messageContent.trim() || undefined,
                brickId: brickId,
            });

            setSentUsers((prev) => ({ ...prev, [userId]: true }));
            setMessageContent(''); // Clear message after sending
            toast.success(t('toast.success'));

            setTimeout(() => {
                setSentUsers((prev) => ({ ...prev, [userId]: false }));
            }, 3000);
        } catch {
            toast.error(t('toast.error'));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background border border-primary/20 rounded-xl shadow-[0_0_40px_rgba(0,238,255,0.1)] w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <Link2 className="size-5 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
                            {t('title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    {/* Copy Link Section */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {t('copyLink')}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-muted/50 border border-primary/10 rounded-sm px-3 py-2 text-xs font-mono text-foreground/80 truncate focus:outline-none focus:border-primary/30"
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={cn(
                                    'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer',
                                    copied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                        : 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30',
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="size-4" />
                                        {tShare('copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-4" />
                                        {tShare('copy')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <hr className="border-primary/10" />

                    {/* Send as Message Section */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {t('sendTo')}
                        </label>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-muted/30 border border-primary/10 rounded-sm pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/30 text-foreground"
                            />
                        </div>

                        {/* Optional Message */}
                        <textarea
                            placeholder={t('optionalMessage')}
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            className="w-full bg-muted/30 border border-primary/10 rounded-sm px-3 py-2 text-sm min-h-[60px] resize-y focus:outline-none focus:border-primary/30 text-foreground"
                        />

                        {/* Conversations List */}
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1 mt-2">
                            {isLoadingConversations ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                    <Loader2 className="size-5 animate-spin" />
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="text-center py-4 text-xs text-muted-foreground italic">
                                    {t('noConversations')}
                                </div>
                            ) : (
                                filteredConversations.map((conv: Conversation) => {
                                    const isSending =
                                        sendMessageMutation.isPending &&
                                        selectedUserId === conv.partner.id;
                                    const isSent = sentUsers[conv.partner.id];

                                    return (
                                        <div
                                            key={conv.id}
                                            className="flex items-center justify-between p-2 rounded-sm hover:bg-primary/5 transition-colors group cursor-pointer"
                                            onClick={() => {
                                                if (!isSent && !isSending) {
                                                    setSelectedUserId(conv.partner.id);
                                                    handleSend(conv.partner.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full border border-primary/20 overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {conv.partner.avatar ? (
                                                        <Image
                                                            src={getAvatarUrl(
                                                                conv.partner.avatar,
                                                                conv.partner.gender,
                                                            )}
                                                            alt={conv.partner.fullName}
                                                            width={32}
                                                            height={32}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        conv.partner.fullName
                                                            .slice(0, 2)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {conv.partner.fullName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        @{conv.partner.username}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                disabled={isSent || isSending}
                                                className={cn(
                                                    'h-7 px-3 rounded-sm text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center',
                                                    isSent
                                                        ? 'opacity-100 bg-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-400'
                                                        : 'bg-primary/10 text-primary hover:bg-primary/20',
                                                )}
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    if (!isSent && !isSending) {
                                                        setSelectedUserId(conv.partner.id);
                                                        handleSend(conv.partner.id);
                                                    }
                                                }}
                                            >
                                                {isSending ? (
                                                    <Loader2 className="size-3 animate-spin" />
                                                ) : isSent ? (
                                                    t('sent')
                                                ) : (
                                                    t('send')
                                                )}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
