import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types/auth.types';
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
