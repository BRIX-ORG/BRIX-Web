import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    BrickDonation,
    PaginatedOnchainActivitiesResponse,
    PaginatedDonationsResponse,
} from '@/types/brick.types';
import type { ApiResponse } from '@/types/api.types';

export const useGetDonations = (brickId: string) => {
    return useQuery({
        queryKey: ['brick-donations', brickId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickDonation[]>>(
                `/api/bricks/${brickId}/donations`,
            );
            return response.data.data;
        },
        enabled: !!brickId,
    });
};

export const useGetOnchainActivities = (idOrUsername: string | undefined, limit = 20) => {
    return useInfiniteQuery({
        queryKey: ['onchainActivities', idOrUsername],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedOnchainActivitiesResponse>>(
                `/api/onchain/activities/user/${idOrUsername}?${params.toString()}`,
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
};

export const useGetOnchainDonations = (idOrUsername: string | undefined, limit = 20) => {
    return useInfiniteQuery({
        queryKey: ['onchainDonations', idOrUsername],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.set('limit', limit.toString());
            params.set('offset', pageParam.toString());

            const response = await apiClient.get<ApiResponse<PaginatedDonationsResponse>>(
                `/api/onchain/donations/user/${idOrUsername}?${params.toString()}`,
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
};
