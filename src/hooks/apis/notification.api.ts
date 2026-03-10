import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedNotifications } from '@/types/notification.types';
import type { ApiResponse } from '@/types/api.types';

export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (params: { limit?: number; offset?: number }) =>
        [...notificationKeys.lists(), params] as const,
    unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications(params: { limit?: number; offset?: number } = {}) {
    return useQuery({
        queryKey: notificationKeys.list(params),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<PaginatedNotifications>>(
                '/api/notifications',
                {
                    params,
                },
            );
            return response.data.data;
        },
    });
}

export function useInfiniteNotifications(params: { limit?: number } = { limit: 20 }) {
    return useInfiniteQuery({
        queryKey: [...notificationKeys.lists(), 'infinite', params],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await apiClient.get<ApiResponse<PaginatedNotifications>>(
                '/api/notifications',
                {
                    params: {
                        ...params,
                        offset: pageParam,
                    },
                },
            );
            return response.data.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.data.length === lastPage.limit) {
                return lastPage.offset + lastPage.limit;
            }
            return undefined;
        },
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<{ count: number }>>(
                '/api/notifications/unread-count',
            );
            return response.data.data.count;
        },
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.put(`/api/notifications/${id}/read`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await apiClient.put('/api/notifications/read-all');
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/api/notifications/${id}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
