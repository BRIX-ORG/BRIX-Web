'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ChatHeader, MessageBubble, BrickMessage, MessageInput } from '@/components/messages';
import {
    useChatStore,
    useConversationMessages,
    useCurrentConversation,
    useTypingUsers,
} from '@/stores/chat-store';
import { useChatSocket } from '@/providers/ChatSocketProvider';
import {
    useGetMessages,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    useToggleReaction,
    useMarkConversationRead,
} from '@/hooks/apis/message.api';
import { getAvatarUrl } from '@/utils/cloudinary';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { Message, Conversation } from '@/types/message.types';

interface ChatAreaProps {
    onToggleInfo?: () => void;
}

export function ChatArea({ onToggleInfo }: ChatAreaProps) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const toast = useToast();

    const conversation = useCurrentConversation();
    const conversationId = conversation?.id ?? null;
    const messages = useConversationMessages(conversationId);
    const typingUsers = useTypingUsers(conversationId);
    const partnerIsTyping = conversation ? typingUsers.includes(conversation.partner.id) : false;

    const { joinConversation, emitTyping, emitStopTyping } = useChatSocket();
    const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetMessages(
        conversationId ?? undefined,
    );
    const sendMessage = useSendMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();
    const toggleReaction = useToggleReaction();
    const markRead = useMarkConversationRead();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const isNearBottomRef = useRef(true);
    const [showScrollDown, setShowScrollDown] = useState(false);

    // ─── Join/leave conversation room ───────────────────────

    useEffect(() => {
        if (!conversationId) return;
        joinConversation(conversationId);
        markRead.mutate(conversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // ─── Auto-scroll on new messages ────────────────────────

    useEffect(() => {
        if (isNearBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    // ─── Preserve scroll on prepend (load older) ────────────

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !isFetchingNextPage) return;

        // Before fetch, capture scroll height
        prevScrollHeightRef.current = container.scrollHeight;
    }, [isFetchingNextPage]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || prevScrollHeightRef.current === 0) return;

        const newScrollHeight = container.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;
        if (diff > 0) {
            container.scrollTop += diff;
        }
        prevScrollHeightRef.current = 0;
    }, [messages]);

    // ─── Scroll detection ───────────────────────────────────

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
        setShowScrollDown(!isNearBottomRef.current);

        // Load older messages when scrolled to top
        if (scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
            prevScrollHeightRef.current = container.scrollHeight;
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ─── Send message ───────────────────────────────────────

    const handleSend = useCallback(
        (data: { content?: string; images?: File[]; voice?: File; file?: File }) => {
            if (!conversation || !currentUserId) return;

            const tempId = crypto.randomUUID();

            // Optimistic message
            const optimistic: Message = {
                id: tempId,
                conversationId: conversation.id,
                senderId: currentUserId,
                content: data.content || '',
                images: [],
                voice: null,
                file: null,
                brickId: null,
                reactions: null,
                isRead: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _tempId: tempId,
                _status: 'sending',
            };

            useChatStore.getState().addMessage(conversation.id, optimistic);

            sendMessage.mutate(
                {
                    receiverId: conversation.partner.id,
                    content: data.content,
                    images: data.images,
                    voice: data.voice,
                    file: data.file,
                },
                {
                    onSuccess: (realMessage) => {
                        const store = useChatStore.getState();
                        const convId = conversation.id;
                        const realConvId = realMessage.conversationId;

                        // If this was a placeholder conversation, swap it for the real one
                        if (convId !== realConvId) {
                            store.replaceMessage(tempId, realMessage, convId);
                            store.removeConversation(convId);

                            apiClient
                                .get<ApiResponse<Conversation>>(`/api/conversations/${realConvId}`)
                                .then((res) => {
                                    store.upsertConversation(res.data.data);
                                    store.setCurrentConversation(realConvId);
                                    joinConversation(realConvId);
                                });
                        } else {
                            store.replaceMessage(tempId, realMessage);
                        }
                    },
                    onError: () => {
                        useChatStore.getState().updateMessage({
                            id: tempId,
                            _status: 'failed',
                        });
                    },
                },
            );
        },
        [conversation, currentUserId, sendMessage, joinConversation],
    );

    // ─── Reaction ───────────────────────────────────────────

    const handleReaction = useCallback(
        (messageId: string, emoji: string) => {
            toggleReaction.mutate({ messageId, emoji });
        },
        [toggleReaction],
    );

    // ─── Edit ───────────────────────────────────────────────

    const handleEdit = useCallback(
        (messageId: string, content: string) => {
            editMessage.mutate(
                { messageId, content },
                {
                    onSuccess: () => toast.success('Message edited'),
                    onError: () => toast.error('Failed to edit message'),
                },
            );
        },
        [editMessage, toast],
    );

    // ─── Delete ─────────────────────────────────────────────

    const handleDelete = useCallback(
        (messageId: string) => {
            if (!conversationId) return;
            deleteMessage.mutate(
                { messageId, conversationId },
                {
                    onSuccess: () => toast.success('Message deleted'),
                    onError: () => toast.error('Failed to delete message'),
                },
            );
        },
        [conversationId, deleteMessage, toast],
    );

    // ─── Typing ─────────────────────────────────────────────

    const handleTyping = useCallback(() => {
        if (conversationId) emitTyping(conversationId);
    }, [conversationId, emitTyping]);

    const handleStopTyping = useCallback(() => {
        if (conversationId) emitStopTyping(conversationId);
    }, [conversationId, emitStopTyping]);

    // ─── Date dividers ──────────────────────────────────────

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'TODAY';
        if (days === 1) return 'YESTERDAY';
        return date
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            .toUpperCase();
    };

    const shouldShowDateDivider = (msg: Message, prevMsg: Message | undefined) => {
        if (!prevMsg) return true;
        const d1 = new Date(msg.createdAt).toDateString();
        const d2 = new Date(prevMsg.createdAt).toDateString();
        return d1 !== d2;
    };

    // ─── Empty state ────────────────────────────────────────

    if (!conversation) {
        return (
            <section className="h-full flex flex-col items-center justify-center bg-background/50">
                <MessageSquare className="size-12 text-muted-foreground/20 mb-4" />
                <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Select a conversation
                </p>
            </section>
        );
    }

    const currentUserAvatar = session?.user?.avatar
        ? getAvatarUrl(session.user.avatar, session.user.gender)
        : undefined;

    return (
        <section className="h-full flex flex-col bg-background/50 min-w-0">
            {/* Header */}
            <ChatHeader
                partner={conversation.partner}
                conversationId={conversation.id}
                onToggleInfo={onToggleInfo}
            />

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 flex flex-col"
            >
                {/* Spacer pushes messages to bottom when few */}
                <div className="flex-1" />

                <div className="space-y-4">
                    {/* Load older */}
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="size-5 text-primary animate-spin" />
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="size-6 text-primary animate-spin" />
                        </div>
                    )}

                    {!isLoading &&
                        messages.map((msg, i) => {
                            const prevMsg = messages[i - 1];
                            const showDivider = shouldShowDateDivider(msg, prevMsg);
                            const isMe = msg.senderId === currentUserId;

                            return (
                                <div key={msg._tempId || msg.id}>
                                    {/* Date divider */}
                                    {showDivider && (
                                        <div className="flex items-center gap-4 py-4">
                                            <div className="flex-1 h-px bg-border" />
                                            <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">
                                                {getDateLabel(msg.createdAt)}
                                            </span>
                                            <div className="flex-1 h-px bg-border" />
                                        </div>
                                    )}

                                    {/* Brick message */}
                                    {msg.brickId ? (
                                        <BrickMessage
                                            message={msg}
                                            isMe={isMe}
                                            partner={conversation.partner}
                                        />
                                    ) : (
                                        <MessageBubble
                                            message={msg}
                                            isMe={isMe}
                                            partner={conversation.partner}
                                            currentUserId={currentUserId}
                                            currentUserAvatar={currentUserAvatar}
                                            onReaction={handleReaction}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    )}
                                </div>
                            );
                        })}
                </div>
                {/* Typing indicator bubble */}
                {partnerIsTyping && (
                    <div className="flex items-end gap-3">
                        <Image
                            src={getAvatarUrl(
                                conversation.partner.avatar,
                                conversation.partner.gender,
                            )}
                            alt={conversation.partner.username}
                            width={28}
                            height={28}
                            className="size-7 rounded-full bg-muted object-cover border border-primary/20 shrink-0"
                        />
                        <div className="bg-muted border border-border rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                            <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                            <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollDown && (
                <button
                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-24 right-8 size-10 flex items-center justify-center bg-muted border border-border rounded-full shadow-lg hover:border-primary transition-colors z-10"
                >
                    <span className="text-lg leading-none">↓</span>
                </button>
            )}

            {/* Input */}
            <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                onClick={() => {
                    if (conversationId) markRead.mutate(conversationId);
                }}
                isSending={sendMessage.isPending}
            />
        </section>
    );
}
