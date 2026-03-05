'use client';

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
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
    const { data: session } = useSession();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const joinedRoomsRef = useRef<Set<string>>(new Set());

    // Connect / disconnect based on session
    useEffect(() => {
        const token = session?.accessToken;
        if (!token) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return () => setIsConnected(false);
        }

        const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            // Re-join all rooms on reconnect
            for (const roomId of joinedRoomsRef.current) {
                socket.emit('joinConversation', { conversationId: roomId });
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // ─── Socket Event Handlers → Store Actions ──────────

        socket.on('newMessage', (message: SocketNewMessageEvent) => {
            useChatStore.getState().addMessage(message.conversationId, message);
        });

        socket.on('messageUpdated', (message: SocketMessageUpdatedEvent) => {
            useChatStore.getState().updateMessage({ ...message, _isEdited: true });
        });

        socket.on('messageDeleted', (event: SocketMessageDeletedEvent) => {
            useChatStore.getState().deleteMessage(event.messageId, event.conversationId);
        });

        socket.on('messageReaction', (event: SocketMessageReactionEvent) => {
            useChatStore.getState().updateMessageReactions(event.messageId, event.reactions);
        });

        socket.on('messagesRead', (event: SocketMessagesReadEvent) => {
            useChatStore.getState().markMessagesAsRead(event.conversationId, event.readerId);
        });

        socket.on('typing', (event: SocketTypingEvent) => {
            useChatStore.getState().addTyping(event.conversationId, event.userId);
            // Auto-expire typing after 5s
            setTimeout(() => {
                useChatStore.getState().removeTyping(event.conversationId, event.userId);
            }, 5000);
        });

        socket.on('stopTyping', (event: SocketTypingEvent) => {
            useChatStore.getState().removeTyping(event.conversationId, event.userId);
        });

        socket.on('typingList', (event: SocketTypingListEvent) => {
            useChatStore.getState().setTypingList(event.conversationId, event.users);
        });

        socket.on('userOnline', (event: SocketUserOnlineEvent) => {
            useChatStore.getState().setPartnerOnline(event.userId);
        });

        socket.on('userOffline', (event: SocketUserOfflineEvent) => {
            useChatStore.getState().setPartnerOffline(event.userId, event.lastSeenAt);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [session?.accessToken]);

    // ─── Public API ─────────────────────────────────────────

    const joinConversation = useCallback((conversationId: string) => {
        joinedRoomsRef.current.add(conversationId);
        socketRef.current?.emit('joinConversation', { conversationId });
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        joinedRoomsRef.current.delete(conversationId);
        socketRef.current?.emit('leaveConversation', { conversationId });
    }, []);

    const emitTyping = useCallback((conversationId: string) => {
        socketRef.current?.emit('typing', { conversationId });
    }, []);

    const emitStopTyping = useCallback((conversationId: string) => {
        socketRef.current?.emit('stopTyping', { conversationId });
    }, []);

    const value: ChatSocketContextValue = {
        joinConversation,
        leaveConversation,
        emitTyping,
        emitStopTyping,
        isConnected,
    };

    return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}
