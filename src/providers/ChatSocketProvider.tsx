'use client';

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/stores/chat-store';
import type {
    SocketNewMessageEvent,
    SocketMessageUpdatedEvent,
    SocketMessageDeletedEvent,
    SocketMessageReactionEvent,
    SocketMessagesReadEvent,
    SocketTypingEvent,
    SocketUserOnlineEvent,
    SocketUserOfflineEvent,
    SocketTypingListEvent,
} from '@/types/message.types';

// ─── Context ────────────────────────────────────────────────────

interface ChatSocketContextValue {
    /** Join a conversation room to receive realtime events */
    joinConversation: (conversationId: string) => void;
    /** Leave a conversation room */
    leaveConversation: (conversationId: string) => void;
    /** Emit typing indicator */
    emitTyping: (conversationId: string) => void;
    /** Emit stop typing */
    emitStopTyping: (conversationId: string) => void;
    /** Whether socket is connected */
    isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
    joinConversation: () => {},
    leaveConversation: () => {},
    emitTyping: () => {},
    emitStopTyping: () => {},
    isConnected: false,
});

export function useChatSocket() {
    return useContext(ChatSocketContext);
}

// ─── Provider ───────────────────────────────────────────────────

interface ChatSocketProviderProps {
    children: ReactNode;
}

export function ChatSocketProvider({ children }: ChatSocketProviderProps) {
    const { socket, isConnected } = useSocket({ namespace: '/chat' });
    const joinedRoomsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!socket) return;

        // ─── Socket Event Handlers → Store Actions ──────────

        const handleNewMessage = (message: SocketNewMessageEvent) => {
            const storeState = useChatStore.getState();
            const conv = storeState.conversations[message.conversationId];
            const isCurrentConv = storeState.currentConversationId === message.conversationId;

            storeState.addMessage(message.conversationId, message);

            if (!conv && !isCurrentConv) {
                const newState = useChatStore.getState();
                newState.setTotalUnread(newState.totalUnread + 1);
            }
        };

        const handleMessageUpdated = (message: SocketMessageUpdatedEvent) => {
            useChatStore.getState().updateMessage({ ...message, _isEdited: true });
        };

        const handleMessageDeleted = (event: SocketMessageDeletedEvent) => {
            useChatStore.getState().deleteMessage(event.messageId, event.conversationId);
        };

        const handleMessageReaction = (event: SocketMessageReactionEvent) => {
            useChatStore.getState().updateMessageReactions(event.messageId, event.reactions);
        };

        const handleMessagesRead = (event: SocketMessagesReadEvent) => {
            useChatStore.getState().markMessagesAsRead(event.conversationId, event.readerId);
        };

        const handleTyping = (event: SocketTypingEvent) => {
            useChatStore.getState().addTyping(event.conversationId, event.userId);
            setTimeout(() => {
                useChatStore.getState().removeTyping(event.conversationId, event.userId);
            }, 5000);
        };

        const handleStopTyping = (event: SocketTypingEvent) => {
            useChatStore.getState().removeTyping(event.conversationId, event.userId);
        };

        const handleTypingList = (event: SocketTypingListEvent) => {
            useChatStore.getState().setTypingList(event.conversationId, event.users);
        };

        const handleUserOnline = (event: SocketUserOnlineEvent) => {
            useChatStore.getState().setPartnerOnline(event.userId);
        };

        const handleUserOffline = (event: SocketUserOfflineEvent) => {
            useChatStore.getState().setPartnerOffline(event.userId, event.lastSeenAt);
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageUpdated', handleMessageUpdated);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('messageReaction', handleMessageReaction);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);
        socket.on('typingList', handleTypingList);
        socket.on('userOnline', handleUserOnline);
        socket.on('userOffline', handleUserOffline);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageUpdated', handleMessageUpdated);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('messageReaction', handleMessageReaction);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);
            socket.off('typingList', handleTypingList);
            socket.off('userOnline', handleUserOnline);
            socket.off('userOffline', handleUserOffline);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Re-join all rooms on reconnect
        for (const roomId of joinedRoomsRef.current) {
            socket.emit('joinConversation', { conversationId: roomId });
        }
    }, [socket, isConnected]);

    // ─── Public API ─────────────────────────────────────────

    const joinConversation = useCallback(
        (conversationId: string) => {
            joinedRoomsRef.current.add(conversationId);
            if (isConnected && socket) {
                socket.emit('joinConversation', { conversationId });
            }
        },
        [socket, isConnected],
    );

    const leaveConversation = useCallback(
        (conversationId: string) => {
            joinedRoomsRef.current.delete(conversationId);
            if (isConnected && socket) {
                socket.emit('leaveConversation', { conversationId });
            }
        },
        [socket, isConnected],
    );

    const emitTyping = useCallback(
        (conversationId: string) => {
            if (isConnected && socket) {
                socket.emit('typing', { conversationId });
            }
        },
        [socket, isConnected],
    );

    const emitStopTyping = useCallback(
        (conversationId: string) => {
            if (isConnected && socket) {
                socket.emit('stopTyping', { conversationId });
            }
        },
        [socket, isConnected],
    );

    const value: ChatSocketContextValue = {
        joinConversation,
        leaveConversation,
        emitTyping,
        emitStopTyping,
        isConnected,
    };

    return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}
