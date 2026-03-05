import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Conversation, Message, MessageReactions } from '@/types/message.types';

// ─── State ──────────────────────────────────────────────────────

interface ChatState {
    /** All loaded conversations keyed by id */
    conversations: Record<string, Conversation>;
    /** Conversation list order (sorted by updatedAt desc) */
    conversationOrder: string[];

    /** Normalized messages keyed by message id */
    messagesById: Record<string, Message>;
    /** conversationId → ordered message ids (oldest → newest) */
    conversationMessages: Record<string, string[]>;

    /** conversationId → userIds currently typing */
    typingUsers: Record<string, string[]>;

    /** Currently open conversation */
    currentConversationId: string | null;

    /** Pagination cursors: conversationId → has more older messages */
    hasMoreMessages: Record<string, boolean>;

    /** Total unread across all conversations */
    totalUnread: number;
}

// ─── Actions ────────────────────────────────────────────────────

interface ChatActions {
    // Conversation actions
    setConversations: (conversations: Conversation[]) => void;
    upsertConversation: (conversation: Conversation) => void;
    removeConversation: (conversationId: string) => void;
    setCurrentConversation: (conversationId: string | null) => void;

    // Message actions — normalized, deduplicated
    addMessage: (conversationId: string, message: Message) => void;
    prependMessages: (conversationId: string, messages: Message[]) => void;
    updateMessage: (message: Partial<Message> & { id: string }) => void;
    replaceMessage: (tempId: string, realMessage: Message, fromConversationId?: string) => void;
    deleteMessage: (messageId: string, conversationId: string) => void;
    updateMessageReactions: (messageId: string, reactions: MessageReactions | null) => void;

    // Read receipt
    markConversationRead: (conversationId: string, readerId: string) => void;
    setUnreadCount: (conversationId: string, count: number) => void;
    setTotalUnread: (count: number) => void;

    // Message read status from socket
    markMessagesAsRead: (conversationId: string, readerId: string) => void;

    // Typing
    addTyping: (conversationId: string, userId: string) => void;
    removeTyping: (conversationId: string, userId: string) => void;
    setTypingList: (conversationId: string, userIds: string[]) => void;

    // Online status
    setPartnerOnline: (userId: string) => void;
    setPartnerOffline: (userId: string, lastSeenAt: string) => void;

    // Pagination
    setHasMoreMessages: (conversationId: string, hasMore: boolean) => void;

    // Reset
    reset: () => void;
}

type ChatStore = ChatState & ChatActions;

// ─── Initial State ──────────────────────────────────────────────

const initialState: ChatState = {
    conversations: {},
    conversationOrder: [],
    messagesById: {},
    conversationMessages: {},
    typingUsers: {},
    currentConversationId: null,
    hasMoreMessages: {},
    totalUnread: 0,
};

// ─── Helper: Re-sort conversation order ─────────────────────────

function sortConversationOrder(conversations: Record<string, Conversation>): string[] {
    return Object.values(conversations)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((c) => c.id);
}

// ─── Store ──────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>((set, get) => ({
    ...initialState,

    // ─── Conversation ───────────────────────────────────────

    setConversations: (conversations) => {
        const map: Record<string, Conversation> = {};

        // Preserve placeholder conversations (no lastMessage yet)
        const existing = get().conversations;
        for (const [id, conv] of Object.entries(existing)) {
            if (!conv.lastMessage) {
                map[id] = conv;
            }
        }

        for (const conv of conversations) {
            map[conv.id] = conv;
        }
        set({
            conversations: map,
            conversationOrder: sortConversationOrder(map),
        });
    },

    upsertConversation: (conversation) => {
        set((state) => {
            const conversations = { ...state.conversations, [conversation.id]: conversation };
            return {
                conversations,
                conversationOrder: sortConversationOrder(conversations),
            };
        });
    },

    removeConversation: (conversationId) => {
        set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [conversationId]: _removed, ...rest } = state.conversations;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [conversationId]: _removedMessages, ...restMessages } =
                state.conversationMessages;

            // Remove messages for this conversation from messagesById
            const messageIds = state.conversationMessages[conversationId] || [];
            const messagesById = { ...state.messagesById };
            for (const id of messageIds) {
                delete messagesById[id];
            }

            return {
                conversations: rest,
                conversationOrder: sortConversationOrder(rest),
                conversationMessages: restMessages,
                messagesById,
                currentConversationId:
                    state.currentConversationId === conversationId
                        ? null
                        : state.currentConversationId,
            };
        });
    },

    setCurrentConversation: (conversationId) => {
        set({ currentConversationId: conversationId });
    },

    // ─── Messages (Normalized) ──────────────────────────────

    addMessage: (conversationId, message) => {
        set((state) => {
            // Deduplicate: skip if already exists
            if (state.messagesById[message.id]) return state;

            const messagesById = { ...state.messagesById, [message.id]: message };
            const existing = state.conversationMessages[conversationId] || [];
            const conversationMessages = {
                ...state.conversationMessages,
                [conversationId]: [...existing, message.id],
            };

            // Update conversation's lastMessage and move to top
            const conv = state.conversations[conversationId];
            let conversations = state.conversations;
            let totalUnread = state.totalUnread;

            if (conv) {
                const isCurrentConv = state.currentConversationId === conversationId;
                const unreadCount = isCurrentConv ? conv.unreadCount : conv.unreadCount + 1;
                if (!isCurrentConv) {
                    totalUnread = state.totalUnread + 1;
                }

                conversations = {
                    ...state.conversations,
                    [conversationId]: {
                        ...conv,
                        lastMessage: message,
                        unreadCount,
                        updatedAt: message.createdAt,
                    },
                };
            }

            return {
                messagesById,
                conversationMessages,
                conversations,
                conversationOrder: sortConversationOrder(conversations),
                totalUnread,
            };
        });
    },

    prependMessages: (conversationId, messages) => {
        set((state) => {
            const messagesById = { ...state.messagesById };
            const newIds: string[] = [];

            for (const msg of messages) {
                if (!messagesById[msg.id]) {
                    messagesById[msg.id] = msg;
                    newIds.push(msg.id);
                }
            }

            const existing = state.conversationMessages[conversationId] || [];
            const conversationMessages = {
                ...state.conversationMessages,
                [conversationId]: [...newIds, ...existing],
            };

            return { messagesById, conversationMessages };
        });
    },

    updateMessage: (partial) => {
        set((state) => {
            const existing = state.messagesById[partial.id];
            if (!existing) return state;

            return {
                messagesById: {
                    ...state.messagesById,
                    [partial.id]: { ...existing, ...partial },
                },
            };
        });
    },

    replaceMessage: (tempId, realMessage, fromConversationId) => {
        set((state) => {
            // The conversation the temp message was stored under
            const sourceConvId = fromConversationId ?? realMessage.conversationId;
            const targetConvId = realMessage.conversationId;

            // Remove temp message from messagesById
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [tempId]: _temp, ...rest } = state.messagesById;

            // If the real message already exists (socket beat API), keep existing
            if (rest[realMessage.id]) {
                const convMsgs = state.conversationMessages[sourceConvId] || [];
                const conversationMessages = { ...state.conversationMessages };
                conversationMessages[sourceConvId] = convMsgs.filter((id) => id !== tempId);
                // Clean up empty source array for temp conversations
                if (
                    sourceConvId !== targetConvId &&
                    conversationMessages[sourceConvId]?.length === 0
                ) {
                    delete conversationMessages[sourceConvId];
                }
                return { messagesById: rest, conversationMessages };
            }

            const messagesById = { ...rest, [realMessage.id]: realMessage };

            const conversationMessages = { ...state.conversationMessages };

            if (sourceConvId !== targetConvId) {
                // Temp→real: move messages from temp conv to real conv
                const sourceMsgs = (conversationMessages[sourceConvId] || []).filter(
                    (id) => id !== tempId,
                );
                const targetMsgs = conversationMessages[targetConvId] || [];
                conversationMessages[targetConvId] = [...sourceMsgs, ...targetMsgs, realMessage.id];
                delete conversationMessages[sourceConvId];
            } else {
                // Same conversation: just swap id
                const convMsgs = conversationMessages[targetConvId] || [];
                conversationMessages[targetConvId] = convMsgs.map((id) =>
                    id === tempId ? realMessage.id : id,
                );
            }

            return { messagesById, conversationMessages };
        });
    },

    deleteMessage: (messageId, conversationId) => {
        set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [messageId]: _deleted, ...messagesById } = state.messagesById;
            const convMsgs = (state.conversationMessages[conversationId] || []).filter(
                (id) => id !== messageId,
            );

            const conversationMessages = {
                ...state.conversationMessages,
                [conversationId]: convMsgs,
            };

            // Update lastMessage if the deleted one was lastMessage
            const conv = state.conversations[conversationId];
            let conversations = state.conversations;
            if (conv?.lastMessage?.id === messageId) {
                const lastMsgId = convMsgs[convMsgs.length - 1];
                conversations = {
                    ...conversations,
                    [conversationId]: {
                        ...conv,
                        lastMessage: lastMsgId ? messagesById[lastMsgId] : null,
                    },
                };
            }

            return { messagesById, conversationMessages, conversations };
        });
    },

    updateMessageReactions: (messageId, reactions) => {
        set((state) => {
            const msg = state.messagesById[messageId];
            if (!msg) return state;
            return {
                messagesById: {
                    ...state.messagesById,
                    [messageId]: { ...msg, reactions },
                },
            };
        });
    },

    // ─── Read Receipts ──────────────────────────────────────

    markConversationRead: (conversationId) => {
        set((state) => {
            const conv = state.conversations[conversationId];
            if (!conv) return state;

            const diff = conv.unreadCount;
            return {
                conversations: {
                    ...state.conversations,
                    [conversationId]: { ...conv, unreadCount: 0 },
                },
                totalUnread: Math.max(0, state.totalUnread - diff),
            };
        });
    },

    setUnreadCount: (conversationId, count) => {
        set((state) => {
            const conv = state.conversations[conversationId];
            if (!conv) return state;
            return {
                conversations: {
                    ...state.conversations,
                    [conversationId]: { ...conv, unreadCount: count },
                },
            };
        });
    },

    setTotalUnread: (count) => set({ totalUnread: count }),

    markMessagesAsRead: (conversationId, readerId) => {
        set((state) => {
            const msgIds = state.conversationMessages[conversationId] || [];
            const messagesById = { ...state.messagesById };
            let changed = false;

            for (const id of msgIds) {
                const msg = messagesById[id];
                // Mark messages sent by current user as read by the other person
                if (msg && msg.senderId !== readerId && !msg.isRead) {
                    messagesById[id] = { ...msg, isRead: true };
                    changed = true;
                }
            }

            return changed ? { messagesById } : state;
        });
    },

    // ─── Typing ─────────────────────────────────────────────

    addTyping: (conversationId, userId) => {
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            if (current.includes(userId)) return state;
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: [...current, userId],
                },
            };
        });
    },

    removeTyping: (conversationId, userId) => {
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            if (!current.includes(userId)) return state;
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: current.filter((id) => id !== userId),
                },
            };
        });
    },

    setTypingList: (conversationId, userIds) => {
        set((state) => ({
            typingUsers: { ...state.typingUsers, [conversationId]: userIds },
        }));
    },

    // ─── Online Status ──────────────────────────────────────

    setPartnerOnline: (userId) => {
        set((state) => {
            const conversations = { ...state.conversations };
            let changed = false;
            for (const id of Object.keys(conversations)) {
                if (
                    conversations[id].partner.id === userId &&
                    !conversations[id].partner.isOnline
                ) {
                    conversations[id] = {
                        ...conversations[id],
                        partner: { ...conversations[id].partner, isOnline: true },
                    };
                    changed = true;
                }
            }
            return changed ? { conversations } : state;
        });
    },

    setPartnerOffline: (userId, lastSeenAt) => {
        set((state) => {
            const conversations = { ...state.conversations };
            let changed = false;
            for (const id of Object.keys(conversations)) {
                if (conversations[id].partner.id === userId && conversations[id].partner.isOnline) {
                    conversations[id] = {
                        ...conversations[id],
                        partner: { ...conversations[id].partner, isOnline: false, lastSeenAt },
                    };
                    changed = true;
                }
            }
            return changed ? { conversations } : state;
        });
    },

    // ─── Pagination ─────────────────────────────────────────

    setHasMoreMessages: (conversationId, hasMore) => {
        set((state) => ({
            hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
        }));
    },

    // ─── Reset ──────────────────────────────────────────────

    reset: () => set(initialState),
}));

// ─── Selectors ──────────────────────────────────────────────────

export function useCurrentConversation() {
    return useChatStore((s) => {
        const id = s.currentConversationId;
        return id ? (s.conversations[id] ?? null) : null;
    });
}

export function useConversationMessages(conversationId: string | null) {
    const ids = useChatStore(
        useShallow((s) => (conversationId ? s.conversationMessages[conversationId] || [] : [])),
    );
    const messagesById = useChatStore((s) => s.messagesById);
    if (!conversationId) return [] as Message[];
    return ids.map((id) => messagesById[id]).filter(Boolean) as Message[];
}

export function useTypingUsers(conversationId: string | null) {
    return useChatStore(
        useShallow((s) => (conversationId ? s.typingUsers[conversationId] || [] : [])),
    );
}

/**
 * Find a conversation by partner userId (non-hook, imperative).
 * Returns the conversation or undefined.
 */
export function findConversationByPartnerId(partnerId: string): Conversation | undefined {
    const state = useChatStore.getState();
    return Object.values(state.conversations).find((c) => c.partner.id === partnerId);
}
