import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    LocationAutocompleteRequest,
    LocationAutocompleteResponse,
} from '@/types/location.types';

/**
 * Search for location suggestions as the user types
 * @param params - Search parameters including query string and filters
 */
export function useLocationAutocomplete(
    params: LocationAutocompleteRequest,
    enabled: boolean = true,
) {
    return useQuery({
        queryKey: ['location', 'autocomplete', params],
        queryFn: async () => {
            // Build query string from parameters
            const queryParams = new URLSearchParams();
            queryParams.append('q', params.q);

            if (params.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }

            if (params.countrycodes) {
                queryParams.append('countrycodes', params.countrycodes);
            }

            if (params.normalizecity !== undefined) {
                queryParams.append('normalizecity', params.normalizecity.toString());
            }

            if (params.lang) {
                queryParams.append('lang', params.lang);
            }

            const response = await apiClient.get<LocationAutocompleteResponse>(
                `/api/location/autocomplete?${queryParams.toString()}`,
            );
            return response.data.data;
        },
        enabled: enabled && params.q.length > 0, // Only run if query is not empty
        staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
        retry: 1, // Only retry once on failure
    });
}
