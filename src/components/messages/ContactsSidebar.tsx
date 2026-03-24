'use client';

import { useEffect } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useChatStore } from '@/stores/chat-store';
import { useGetConversations, useMarkConversationRead } from '@/hooks/apis/message.api';
import { useChatSocket } from '@/providers/ChatSocketProvider';
import { ContactItem } from '@/components/messages';
import { useTranslations } from 'next-intl';

export function ContactsSidebar() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const t = useTranslations('messages.ContactsSidebar');

    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useGetConversations();
    const { joinConversation } = useChatSocket();

    // Sync fetched conversations to Zustand store via effect (not during render)
    const setConversations = useChatStore((s) => s.setConversations);
    useEffect(() => {
        if (!data) return;
        const allConversations = data.pages.flatMap((page) => page.data);
        setConversations(allConversations);
    }, [data, setConversations]);

    // Join all conversation rooms so we receive newMessage, typing, etc.
    const conversationOrder = useChatStore((s) => s.conversationOrder);
    useEffect(() => {
        for (const id of conversationOrder) {
            joinConversation(id);
        }
    }, [conversationOrder, joinConversation]);
    const conversations = useChatStore((s) => s.conversations);
    const currentConversationId = useChatStore((s) => s.currentConversationId);
    const setCurrentConversation = useChatStore((s) => s.setCurrentConversation);
    const markRead = useMarkConversationRead();

    const handleConversationSelect = (id: string) => {
        setCurrentConversation(id);
        markRead.mutate(id);
    };

    const onlineConversations = conversationOrder.filter(
        (id) => conversations[id]?.partner.isOnline,
    );
    const offlineConversations = conversationOrder.filter(
        (id) => !conversations[id]?.partner.isOnline,
    );

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <aside className="w-72 border-r border-border bg-background flex flex-col">
            {/* Active Sessions */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-primary/60 uppercase">
                        {t('activeSessions')}
                    </span>
                    <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(0,238,255,0.5)]" />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin text-primary" />
                    </div>
                ) : onlineConversations.length > 0 ? (
                    <div className="space-y-1">
                        {onlineConversations.map((id) => (
                            <ContactItem
                                key={id}
                                conversation={conversations[id]}
                                isActive={id === currentConversationId}
                                currentUserId={currentUserId}
                                onClick={() => handleConversationSelect(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest text-center py-3">
                        {t('noActiveSessions')}
                    </p>
                )}
            </div>

            {/* Offline / Inactive */}
            <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase mb-4 block">
                    {t('offline')}
                </span>

                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin text-primary/40" />
                    </div>
                ) : offlineConversations.length > 0 ? (
                    <div className="space-y-1">
                        {offlineConversations.map((id) => (
                            <ContactItem
                                key={id}
                                conversation={conversations[id]}
                                isActive={id === currentConversationId}
                                currentUserId={currentUserId}
                                onClick={() => handleConversationSelect(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest text-center py-3">
                        {t('noOfflineContacts')}
                    </p>
                )}

                {/* Load more */}
                {hasNextPage && (
                    <button
                        onClick={handleLoadMore}
                        disabled={isFetchingNextPage}
                        className="w-full mt-3 py-2 text-[10px] font-bold text-primary/60 uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="size-3 animate-spin mx-auto" />
                        ) : (
                            t('loadMore')
                        )}
                    </button>
                )}
            </div>

            {/* Empty state */}
            {!isLoading && conversationOrder.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
                    <MessageCircle className="size-8 text-muted-foreground/20" />
                    <p className="text-[10px] text-muted-foreground/50 font-mono uppercase text-center">
                        {t('noConversations')}
                    </p>
                </div>
            )}
        </aside>
    );
}
