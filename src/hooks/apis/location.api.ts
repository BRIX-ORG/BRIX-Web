import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    LocationAutocompleteRequest,
    LocationSuggestion,
    LocationReverseRequest,
    LocationReverseData,
} from '@/types/location.types';
import type { ApiResponse } from '@/types/api.types';

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

            const response = await apiClient.get<ApiResponse<LocationSuggestion[]>>(
                `/api/location/autocomplete?${queryParams.toString()}`,
            );
            return response.data.data;
        },
        enabled: enabled && params.q.length > 0, // Only run if query is not empty
        staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
        retry: 1, // Only retry once on failure
    });
}

/**
 * Reverse geocoding: convert coordinates to a human-readable address
 * @param params - Latitude, longitude, and optional formatting options
 * @param enabled - Whether the query should execute
 */
export function useLocationReverse(params: LocationReverseRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: ['location', 'reverse', params.lat, params.lon],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            queryParams.append('lat', params.lat.toString());
            queryParams.append('lon', params.lon.toString());

            if (params.addressdetails !== undefined) {
                queryParams.append('addressdetails', params.addressdetails.toString());
            }

            if (params.lang) {
                queryParams.append('lang', params.lang);
            }

            if (params.normalizeaddress !== undefined) {
                queryParams.append('normalizeaddress', params.normalizeaddress.toString());
            }

            const response = await apiClient.get<ApiResponse<LocationReverseData>>(
                `/api/location/reverse?${queryParams.toString()}`,
            );
            return response.data.data;
        },
        enabled: enabled && params.lat !== 0 && params.lon !== 0,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
        retry: 1,
    });
}
