import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types/auth.types';
import type {
    FollowActionResponse,
    FollowListResponse,
    PaginatedTopUsersResponse,
    UserLocation,
} from '@/types/user.types';
import type { UpdateProfileInput, UpdatePasswordInput } from '@/validations/user';
import { updateUserProfile } from '@/lib/auth-actions';

/**
 * Get user by ID or username
 */
export function useGetUser(idOrUsername: string) {
    return useQuery({
        queryKey: ['user', idOrUsername],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<User>>(`/api/users/${idOrUsername}`);
            return response.data.data;
        },
        enabled: !!idOrUsername,
    });
}

/**
 * Update current user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileInput) => {
            const response = await apiClient.put<ApiResponse<User>>('/api/users/me/profile', data);
            return response.data.data;
        },
        onSuccess: async (updatedUser) => {
            // Update NextAuth session
            await updateUserProfile(updatedUser);

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
}

/**
 * Update current user password
 */
export function useUpdatePassword() {
    return useMutation({
        mutationFn: async (data: Omit<UpdatePasswordInput, 'confirmPassword'>) => {
            const response = await apiClient.put<ApiResponse<User>>('/api/users/me/password', data);
            return response.data.data;
        },
    });
}

/**
 * Upload/update avatar
 */
export function useUpdateAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.put<ApiResponse<User>>(
                '/api/users/me/avatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return response.data.data;
        },
        onSuccess: async (updatedUser) => {
            // Update NextAuth session with new avatar
            await updateUserProfile({ avatar: updatedUser.avatar });

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
}

/**
 * Upload/update background image
 */
export function useUpdateBackground() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.put<ApiResponse<User>>(
                '/api/users/me/background',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return response.data.data;
        },
        onSuccess: async (updatedUser) => {
            // Update NextAuth session with new background
            await updateUserProfile({ background: updatedUser.background });

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
}

/**
 * Follow a user
 */
export function useFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await apiClient.post<ApiResponse<FollowActionResponse>>(
                `/api/follows/${userId}`,
            );
            return response.data.data;
        },
        onSuccess: (_data, userId) => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
            queryClient.invalidateQueries({ queryKey: ['followStatus', userId] });
        },
    });
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await apiClient.delete<ApiResponse<FollowActionResponse>>(
                `/api/follows/${userId}`,
            );
            return response.data.data;
        },
        onSuccess: (_data, userId) => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
            queryClient.invalidateQueries({ queryKey: ['followStatus', userId] });
        },
    });
}

/**
 * Get followers of a user (paginated)
 */
export function useGetFollowers(idOrUsername: string, limit?: number, offset = 0) {
    return useQuery({
        queryKey: ['followers', idOrUsername, limit, offset],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (limit !== undefined) params.set('limit', String(limit));
            if (offset) params.set('offset', String(offset));

            const response = await apiClient.get<ApiResponse<FollowListResponse>>(
                `/api/follows/users/${idOrUsername}/followers`,
                { params },
            );
            return response.data.data;
        },
        enabled: !!idOrUsername,
    });
}

/**
 * Check if current user is following a specific user
 */
export function useCheckFollow(userId: string | undefined) {
    return useQuery({
        queryKey: ['followStatus', userId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<FollowActionResponse>>(
                `/api/follows/check/${userId}`,
            );
            return response.data.data;
        },
        enabled: !!userId,
    });
}

/**
 * Get users that a user is following (paginated)
 */
export function useGetFollowing(idOrUsername: string, limit?: number, offset = 0) {
    return useQuery({
        queryKey: ['following', idOrUsername, limit, offset],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (limit !== undefined) params.set('limit', String(limit));
            if (offset) params.set('offset', String(offset));

            const response = await apiClient.get<ApiResponse<FollowListResponse>>(
                `/api/follows/users/${idOrUsername}/following`,
                { params },
            );
            return response.data.data;
        },
        enabled: !!idOrUsername,
    });
}

/**
 * Get top users sorted by their total followers count
 */
export function useGetTopUsers(limit: number = 10) {
    return useInfiniteQuery({
        queryKey: ['topUsers'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedTopUsersResponse>>(
                `/api/follows/top-users?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage: PaginatedTopUsersResponse) => {
            const nextOffset = lastPage.offset + (lastPage.limit || 0);
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
    });
}

/**
 * Get follow recommendations (friends of friends)
 */
export function useGetFollowRecommendations(limit: number = 10) {
    return useInfiniteQuery({
        queryKey: ['followRecommendations'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<FollowListResponse>>(
                '/api/follows/recommendations',
                { params },
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage: FollowListResponse) => {
            const nextOffset = lastPage.offset + (lastPage.limit || 0);
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
    });
}

/**
 * Get all user locations for map tracking
 */
export function useGetUserLocations() {
    return useQuery({
        queryKey: ['userLocations'],
        queryFn: async () => {
            const response =
                await apiClient.get<ApiResponse<UserLocation[]>>('/api/users/locations');
            return response.data.data;
        },
    });
}
