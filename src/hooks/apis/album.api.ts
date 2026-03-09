import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { Album, PaginatedAlbumsResponse } from '@/types/album.types';
import type { UpdateAlbumInput } from '@/validations/album';

// ═══════════════════════════════════════════════════════════════
// Album Queries
// ═══════════════════════════════════════════════════════════════

/**
 * Get all albums of the current user (paginated).
 */
export function useGetAlbums(limit = 10, offset = 0) {
    return useQuery({
        queryKey: ['albums', limit, offset],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', offset.toString());

            const response = await apiClient.get<ApiResponse<PaginatedAlbumsResponse>>(
                `/api/albums?${params.toString()}`,
            );
            return response.data.data;
        },
    });
}

/**
 * Get detailed information of an album (public).
 */
export function useGetAlbumById(albumId: string | undefined) {
    return useQuery({
        queryKey: ['album', albumId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Album>>(`/api/albums/${albumId}`);
            return response.data.data;
        },
        enabled: !!albumId,
    });
}

// ═══════════════════════════════════════════════════════════════
// Album Mutations
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new album (max 10 images).
 * Sends multipart/form-data with name, description, items (JSON), and image files.
 */
export function useCreateAlbum() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            background?: [string, string, string];
            titleColor?: string;
            descriptionColor?: string;
            items: { title: string; description: string }[];
            images: File[];
        }) => {
            const formData = new FormData();
            formData.append('name', data.name);

            if (data.description) formData.append('description', data.description);
            if (data.background) {
                data.background.forEach((color) => formData.append('background', color));
            }
            if (data.titleColor) formData.append('titleColor', data.titleColor);
            if (data.descriptionColor) formData.append('descriptionColor', data.descriptionColor);

            formData.append('items', JSON.stringify(data.items));

            data.images.forEach((image) => {
                formData.append('images', image);
            });

            const response = await apiClient.post<ApiResponse<Album>>('/api/albums', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
}

/**
 * Update album metadata (name, description, colors).
 */
export function useUpdateAlbum() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ albumId, data }: { albumId: string; data: UpdateAlbumInput }) => {
            const response = await apiClient.put<ApiResponse<Album>>(
                `/api/albums/${albumId}`,
                data,
            );
            return response.data.data;
        },
        onSuccess: (_data, { albumId }) => {
            queryClient.invalidateQueries({ queryKey: ['album', albumId] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
}

/**
 * Delete an album and its images from Cloudinary.
 */
export function useDeleteAlbum() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (albumId: string) => {
            await apiClient.delete(`/api/albums/${albumId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
}
