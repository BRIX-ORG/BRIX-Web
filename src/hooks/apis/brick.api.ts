import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { Brick, GlbBrick } from '@/types/brick.types';
import type { UploadArtBrickFormInput, UploadGlbBrickFormInput } from '@/validations/brick';

/**
 * Upload an art brick (image with watermark)
 */
export function useUploadArtBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { file: File } & UploadArtBrickFormInput) => {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('title', data.title);

            if (data.description) {
                formData.append('description', data.description);
            }

            if (data.address) {
                formData.append('address', data.address);
            }

            if (data.latitude != null) {
                formData.append('latitude', data.latitude.toString());
            }

            if (data.longitude != null) {
                formData.append('longitude', data.longitude.toString());
            }

            const response = await apiClient.post<ApiResponse<Brick>>(
                '/api/bricks/upload/art',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bricks'] });
        },
    });
}

/**
 * Upload a GLB 3D model brick with thumbnails (1-5 images)
 */
export function useUploadGlbBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { glb: File; thumbnails: File[] } & UploadGlbBrickFormInput) => {
            const formData = new FormData();
            formData.append('glb', data.glb);

            data.thumbnails.forEach((thumbnail) => {
                formData.append('thumbnails', thumbnail);
            });

            formData.append('title', data.title);

            if (data.description) {
                formData.append('description', data.description);
            }

            if (data.address) {
                formData.append('address', data.address);
            }

            if (data.latitude != null) {
                formData.append('latitude', data.latitude.toString());
            }

            if (data.longitude != null) {
                formData.append('longitude', data.longitude.toString());
            }

            const response = await apiClient.post<ApiResponse<GlbBrick>>(
                '/api/bricks/upload/glb',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bricks'] });
        },
    });
}
