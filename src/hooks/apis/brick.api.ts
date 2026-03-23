import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type {
    Brick,
    BrickComment,
    BrickDetail,
    BrickTagType,
    BrickUpvoter,
    BrickVoteStatus,
    GlbBrick,
    NewsfeedLocation,
    PaginatedBricksResponse,
    PaginatedCommentsResponse,
    RealtimeSession,
    RealtimeUploadResult,
    PaginatedTopAuthorsResponse,
} from '@/types/brick.types';
import type {
    UploadArtBrickFormInput,
    UploadGlbBrickFormInput,
    UploadRealtimeBrickFormInput,
    UpdateBrickInput,
} from '@/validations/brick';

/**
 * Get bricks of a user by ID or username with optional tag type filter.
 * Uses infinite query for load-more pagination (20 items per page).
 */
export function useGetUserBricks(idOrUsername: string, tagType?: BrickTagType, limit: number = 20) {
    return useInfiniteQuery({
        queryKey: ['userBricks', idOrUsername, tagType],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());
            if (tagType) params.set('tagType', tagType);

            const response = await apiClient.get<ApiResponse<PaginatedBricksResponse>>(
                `/api/bricks/user/${idOrUsername}?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
        enabled: !!idOrUsername,
    });
}

/**
 * Get global newsfeed bricks (sorted by popularity/trending) with optional filters
 */
export function useGetNewsfeedBricks(
    filters?: { tagType?: BrickTagType; timeRange?: string; isPublic?: boolean },
    limit: number = 20,
) {
    return useInfiniteQuery({
        queryKey: ['newsfeedBricks', filters],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            if (filters?.tagType) params.set('tagType', filters.tagType);
            if (filters?.timeRange) params.set('timeRange', filters.timeRange);
            if (filters?.isPublic !== undefined)
                params.set('isPublic', filters.isPublic.toString());

            const response = await apiClient.get<ApiResponse<PaginatedBricksResponse>>(
                `/api/bricks/newsfeed?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
    });
}

/**
 * Get newsfeed bricks from followed users (sorted newest first)
 */
export function useGetFollowingBricks(
    filters?: { tagType?: BrickTagType; isPublic?: boolean },
    limit: number = 20,
) {
    return useInfiniteQuery({
        queryKey: ['followingBricks', filters],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            if (filters?.tagType) params.set('tagType', filters.tagType);
            if (filters?.isPublic !== undefined)
                params.set('isPublic', filters.isPublic.toString());

            const response = await apiClient.get<ApiResponse<PaginatedBricksResponse>>(
                `/api/bricks/newsfeed/following?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.offset + lastPage.limit;
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
    });
}

/**
 * Get lightweight location data for all public bricks
 */
export function useGetNewsfeedLocations(filters?: { tagType?: BrickTagType; isPublic?: boolean }) {
    return useQuery({
        queryKey: ['newsfeedLocations', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.tagType) params.set('tagType', filters.tagType);
            if (filters?.isPublic !== undefined)
                params.set('isPublic', filters.isPublic.toString());

            const response = await apiClient.get<ApiResponse<NewsfeedLocation[]>>(
                `/api/bricks/newsfeed/locations?${params.toString()}`,
            );
            return response.data.data;
        },
    });
}

/**
 * Get lightweight location data for current user's bricks
 */
export function useGetNewsfeedLocationsMe(filters?: {
    tagType?: BrickTagType;
    isPublic?: boolean;
}) {
    return useQuery({
        queryKey: ['newsfeedLocationsMe', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.tagType) params.set('tagType', filters.tagType);
            if (filters?.isPublic !== undefined)
                params.set('isPublic', filters.isPublic.toString());

            const response = await apiClient.get<ApiResponse<NewsfeedLocation[]>>(
                `/api/bricks/newsfeed/locations/me?${params.toString()}`,
            );
            return response.data.data;
        },
    });
}

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

// ═══════════════════════════════════════════════════════════════
// Brick Detail
// ═══════════════════════════════════════════════════════════════

/**
 * Get brick detail by ID
 */
export function useGetBrickDetail(brickId: string | undefined) {
    return useQuery({
        queryKey: ['brick', brickId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickDetail>>(
                `/api/bricks/${brickId}`,
            );
            return response.data.data;
        },
        enabled: !!brickId,
        refetchInterval: (query) => {
            const data = query.state?.data as BrickDetail | undefined;
            return data?.metadata?.onChainStatus === 'pending' ? 3000 : false;
        },
    });
}

/**
 * Update editable brick metadata (title, description, isPublic)
 */
export function useUpdateBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ brickId, data }: { brickId: string; data: UpdateBrickInput }) => {
            const response = await apiClient.put<ApiResponse<Brick>>(
                `/api/bricks/${brickId}`,
                data,
            );
            return response.data.data;
        },
        onSuccess: (_data, { brickId }) => {
            queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
            queryClient.invalidateQueries({ queryKey: ['userBricks'] });
        },
    });
}

/**
 * Delete a brick (owner only)
 */
export function useDeleteBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (brickId: string) => {
            await apiClient.delete(`/api/bricks/${brickId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userBricks'] });
            queryClient.invalidateQueries({ queryKey: ['bricks'] });
        },
    });
}

/**
 * Delete a single thumbnail from a GLB brick by Cloudinary publicId.
 * The brick must retain at least one thumbnail.
 */
export function useDeleteBrickThumbnail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ brickId, publicId }: { brickId: string; publicId: string }) => {
            const response = await apiClient.delete<ApiResponse<Brick>>(
                `/api/bricks/${brickId}/thumbnails`,
                { params: { publicId } },
            );
            return response.data.data;
        },
        onSuccess: (_data, { brickId }) => {
            queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
            queryClient.invalidateQueries({ queryKey: ['userBricks'] });
        },
    });
}

/**
 * Add new thumbnail(s) to a GLB brick (max 5 total).
 * Accepts File objects uploaded as multipart/form-data.
 */
export function useAddBrickThumbnails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ brickId, files }: { brickId: string; files: File[] }) => {
            const formData = new FormData();
            files.forEach((file) => formData.append('thumbnails', file));

            const response = await apiClient.post<ApiResponse<Brick>>(
                `/api/bricks/${brickId}/thumbnails`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            return response.data.data;
        },
        onSuccess: (_data, { brickId }) => {
            queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
            queryClient.invalidateQueries({ queryKey: ['userBricks'] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// Brick Votes
// ═══════════════════════════════════════════════════════════════

/**
 * Get vote status for a brick
 */
export function useGetBrickVotes(brickId: string | undefined) {
    return useQuery({
        queryKey: ['brickVotes', brickId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickVoteStatus>>(
                `/api/bricks/${brickId}/votes`,
            );
            return response.data.data;
        },
        enabled: !!brickId,
    });
}

/**
 * Upvote or downvote a brick (toggle)
 */
export function useVoteBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ brickId, value }: { brickId: string; value: 1 | -1 }) => {
            const response = await apiClient.post<ApiResponse<BrickVoteStatus>>(
                `/api/bricks/${brickId}/vote`,
                { value },
            );
            return response.data.data;
        },
        onSuccess: (data, { brickId }) => {
            queryClient.setQueryData(['brickVotes', brickId], data);
            queryClient.invalidateQueries({ queryKey: ['brickUpvoters', brickId] });
        },
    });
}

/**
 * Get list of users who upvoted this brick
 */
export function useGetBrickUpvoters(brickId: string | undefined) {
    return useQuery({
        queryKey: ['brickUpvoters', brickId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickUpvoter[]>>(
                `/api/bricks/${brickId}/upvoters`,
            );
            return response.data.data;
        },
        enabled: !!brickId,
    });
}

// ═══════════════════════════════════════════════════════════════
// Brick Comments
// ═══════════════════════════════════════════════════════════════

/**
 * Get paginated root comments with nested replies for a brick.
 * Uses cursor-based infinite scroll.
 */
export function useGetBrickComments(brickId: string | undefined, limit = 20) {
    return useInfiniteQuery({
        queryKey: ['brickComments', brickId],
        queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            if (pageParam) params.set('cursor', pageParam);

            const response = await apiClient.get<ApiResponse<PaginatedCommentsResponse>>(
                `/api/bricks/${brickId}/comments?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage) => {
            const comments = lastPage.comments;
            if (comments.length < limit) return undefined;
            return comments[comments.length - 1]?.id;
        },
        initialPageParam: undefined as string | undefined,
        enabled: !!brickId,
    });
}

/**
 * Create a comment or reply on a brick (supports up to 3 images)
 */
export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            brickId,
            content,
            parentId,
            images,
        }: {
            brickId: string;
            content: string;
            parentId?: string;
            images?: File[];
        }) => {
            const formData = new FormData();
            formData.append('content', content);
            if (parentId) formData.append('parentId', parentId);
            if (images) {
                images.forEach((img) => formData.append('images', img));
            }

            const response = await apiClient.post<ApiResponse<BrickComment>>(
                `/api/bricks/${brickId}/comments`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            return response.data.data;
        },
        onSuccess: (_data, { brickId }) => {
            queryClient.invalidateQueries({ queryKey: ['brickComments', brickId] });
            queryClient.invalidateQueries({ queryKey: ['brick', brickId] });
        },
    });
}

/**
 * Edit own comment content
 */
export function useEditComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
            const response = await apiClient.put<ApiResponse<BrickComment>>(
                `/api/bricks/comments/${commentId}`,
                { content },
            );
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brickComments', data.brickId] });
        },
    });
}

/**
 * Delete own comment (or reply)
 */
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, brickId }: { commentId: string; brickId: string }) => {
            await apiClient.delete(`/api/bricks/comments/${commentId}`);
            return { brickId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brickComments', data.brickId] });
            queryClient.invalidateQueries({ queryKey: ['brick', data.brickId] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// Comment Votes
// ═══════════════════════════════════════════════════════════════

/**
 * Get vote status for a comment
 */
export function useGetCommentVotes(commentId: string | undefined) {
    return useQuery({
        queryKey: ['commentVotes', commentId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickVoteStatus>>(
                `/api/bricks/comments/${commentId}/votes`,
            );
            return response.data.data;
        },
        enabled: !!commentId,
    });
}

/**
 * Upvote or downvote a comment (toggle)
 */
export function useVoteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 }) => {
            const response = await apiClient.post<ApiResponse<BrickVoteStatus>>(
                `/api/bricks/comments/${commentId}/vote`,
                { value },
            );
            return response.data.data;
        },
        onSuccess: (data, { commentId }) => {
            queryClient.setQueryData(['commentVotes', commentId], data);
            queryClient.invalidateQueries({ queryKey: ['commentUpvoters', commentId] });
        },
    });
}

/**
 * Get list of users who upvoted a comment
 */
export function useGetCommentUpvoters(commentId: string | undefined) {
    return useQuery({
        queryKey: ['commentUpvoters', commentId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickUpvoter[]>>(
                `/api/bricks/comments/${commentId}/upvoters`,
            );
            return response.data.data;
        },
        enabled: !!commentId,
    });
}

// ═══════════════════════════════════════════════════════════════
// Realtime Photo Capture
// ═══════════════════════════════════════════════════════════════

/**
 * Create a challenge-based photo capture session.
 * Returns sessionId + qrToken (90s TTL). Each session is single-use.
 */
export function useCreateRealtimeSession() {
    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<ApiResponse<RealtimeSession>>(
                '/api/bricks/realtime/session',
            );
            return response.data.data;
        },
    });
}

/**
 * Upload a webcam photo with session validation.
 * Server validates session (valid, not expired, not used),
 * checks image integrity, then queues upload via BullMQ.
 */
export function useUploadRealtimeBrick() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: { file: Blob; sessionId: string } & UploadRealtimeBrickFormInput,
        ) => {
            const formData = new FormData();
            formData.append('file', data.file, 'capture.png');
            formData.append('sessionId', data.sessionId);
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

            if (data.isPublic != null) {
                formData.append('isPublic', data.isPublic.toString());
            }

            const response = await apiClient.post<ApiResponse<RealtimeUploadResult>>(
                '/api/bricks/upload/realtime',
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
            queryClient.invalidateQueries({ queryKey: ['userBricks'] });
        },
    });
}

/**
 * Get top authors by total upvotes of their bricks
 */
export function useGetTopAuthors(limit: number = 10) {
    return useInfiniteQuery({
        queryKey: ['topAuthors'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedTopAuthorsResponse>>(
                `/api/bricks/top-authors?${params.toString()}`,
            );
            return response.data.data;
        },
        getNextPageParam: (lastPage: PaginatedTopAuthorsResponse) => {
            const nextOffset = lastPage.offset + (lastPage.limit || 0);
            return nextOffset < lastPage.total ? nextOffset : undefined;
        },
        initialPageParam: 0,
    });
}
