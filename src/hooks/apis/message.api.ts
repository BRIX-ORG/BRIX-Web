import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type {
    Conversation,
    Message,
    PaginatedConversationsResponse,
    PaginatedMessagesResponse,
    PaginatedMediaResponse,
    PaginatedFilesResponse,
    MessageReactions,
} from '@/types/message.types';
import { useChatStore } from '@/stores/chat-store';

// ═══════════════════════════════════════════════════════════════
// Conversations
// ═══════════════════════════════════════════════════════════════

/**
 * Get paginated conversation list (sorted by updatedAt desc).
 * Syncs to chat store on success.
 */
export function useGetConversations(limit = 30) {
    const { status } = useSession();
    return useInfiniteQuery({
        queryKey: ['conversations'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedConversationsResponse>>(
                `/api/conversations?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
        enabled: status === 'authenticated',
    });
}

/**
 * Get single conversation detail by ID
 */
export function useGetConversation(conversationId: string | undefined) {
    return useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Conversation>>(
                `/api/conversations/${conversationId}`,
            );
            return response.data.data;
        },
        enabled: !!conversationId,
    });
}

/**
 * Delete (hide) a conversation for the current user
 */
export function useDeleteConversation() {
    const queryClient = useQueryClient();
    const removeConversation = useChatStore((s) => s.removeConversation);

    return useMutation({
        mutationFn: async (conversationId: string) => {
            await apiClient.delete(`/api/conversations/${conversationId}`);
            return conversationId;
        },
        onSuccess: (conversationId) => {
            removeConversation(conversationId);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

/**
 * Get unread count for a specific conversation
 */
export function useGetConversationUnreadCount(conversationId: string | undefined) {
    return useQuery({
        queryKey: ['conversationUnread', conversationId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
                `/api/conversations/${conversationId}/unread-count`,
            );
            return response.data.data;
        },
        enabled: !!conversationId,
    });
}

/**
 * Find an existing conversation with a partner (by partner userId).
 * Searches loaded conversations in the store first, falls back to API.
 * Returns the conversation or null if none exists.
 */
export async function getConversationByPartner(partnerId: string): Promise<Conversation | null> {
    // Check store first
    const state = useChatStore.getState();
    const existing = Object.values(state.conversations).find((c) => c.partner.id === partnerId);
    if (existing) return existing;

    // Fallback: dedicated API endpoint
    try {
        const response = await apiClient.get<ApiResponse<Conversation>>(
            `/api/conversations/partner/${partnerId}`,
        );
        return response.data.data;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════════════════════

/**
 * Get messages for a conversation (paginated, newest first from API).
 * Messages are reversed to oldest→newest for display, then synced to store.
 */
export function useGetMessages(conversationId: string | undefined, limit = 30) {
    return useInfiniteQuery({
        queryKey: ['messages', conversationId],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedMessagesResponse>>(
                `/api/conversations/${conversationId}/messages?${params.toString()}`,
            );
            const result = response.data.data;

            // API returns newest first — reverse for chronological order
            const chronological = [...result.data].reverse();

            // Sync to store
            if (pageParam === 0) {
                // First page: these are the most recent messages
                useChatStore.getState().prependMessages(conversationId!, chronological);
            } else {
                // Older pages: prepend older messages
                useChatStore.getState().prependMessages(conversationId!, chronological);
            }

            // Track if there are more older messages
            const nextOffset = result.offset + result.limit;
            useChatStore.getState().setHasMoreMessages(conversationId!, nextOffset < result.total);

            return result;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
        enabled: !!conversationId,
    });
}

/**
 * Send a message (text, images, voice, file, brickId).
 * Supports multipart/form-data for file uploads.
 */
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            receiverId: string;
            content?: string;
            brickId?: string;
            images?: File[];
            voice?: File;
            file?: File;
        }) => {
            const formData = new FormData();
            formData.append('receiverId', data.receiverId);

            if (data.content) formData.append('content', data.content);
            if (data.brickId) formData.append('brickId', data.brickId);
            if (data.images) {
                data.images.forEach((img) => formData.append('images', img));
            }
            if (data.voice) formData.append('voice', data.voice);
            if (data.file) formData.append('file', data.file);

            const response = await apiClient.post<ApiResponse<Message>>('/api/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

/**
 * Edit a message's text content (sender only)
 */
export function useEditMessage() {
    return useMutation({
        mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
            const response = await apiClient.put<ApiResponse<Message>>(
                `/api/messages/${messageId}`,
                { content },
            );
            return response.data.data;
        },
        onSuccess: (updatedMessage) => {
            useChatStore.getState().updateMessage(updatedMessage);
        },
    });
}

/**
 * Delete a message (soft delete, sender only)
 */
export function useDeleteMessage() {
    return useMutation({
        mutationFn: async ({
            messageId,
            conversationId,
        }: {
            messageId: string;
            conversationId: string;
        }) => {
            await apiClient.delete(`/api/messages/${messageId}`);
            return { messageId, conversationId };
        },
        onSuccess: ({ messageId, conversationId }) => {
            useChatStore.getState().deleteMessage(messageId, conversationId);
        },
    });
}

/**
 * Toggle emoji reaction on a message
 */
export function useToggleReaction() {
    return useMutation({
        mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
            const response = await apiClient.post<
                ApiResponse<{ messageId: string; reactions: MessageReactions }>
            >(`/api/messages/${messageId}/react`, { emoji });
            return response.data.data;
        },
        onSuccess: (data) => {
            useChatStore.getState().updateMessageReactions(data.messageId, data.reactions);
        },
    });
}

/**
 * Mark all messages in a conversation as read
 */
export function useMarkConversationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await apiClient.post<ApiResponse<{ markedAsRead: number }>>(
                `/api/conversations/${conversationId}/read`,
            );
            return { conversationId, ...response.data.data };
        },
        onSuccess: ({ conversationId }) => {
            useChatStore.getState().markConversationRead(conversationId, '');
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

/**
 * Get total unread message count across all conversations
 */
export function useGetTotalUnread() {
    const { status } = useSession();
    return useQuery({
        queryKey: ['totalUnread'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<{ totalUnread: number }>>(
                '/api/messages/unread-count',
            );
            return response.data.data;
        },
        enabled: status === 'authenticated',
    });
}

// ═══════════════════════════════════════════════════════════════
// Media & Files
// ═══════════════════════════════════════════════════════════════

/**
 * Get all images in a conversation (paginated)
 */
export function useGetConversationMedia(conversationId: string | undefined, limit = 20) {
    return useInfiniteQuery({
        queryKey: ['conversationMedia', conversationId],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedMediaResponse>>(
                `/api/conversations/${conversationId}/media?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
        enabled: !!conversationId,
    });
}

/**
 * Get all files in a conversation (paginated)
 */
export function useGetConversationFiles(conversationId: string | undefined, limit = 20) {
    return useInfiniteQuery({
        queryKey: ['conversationFiles', conversationId],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedFilesResponse>>(
                `/api/conversations/${conversationId}/files?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
        enabled: !!conversationId,
    });
}
