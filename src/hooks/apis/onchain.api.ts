import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BrickDonation } from '@/types/brick.types';
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
