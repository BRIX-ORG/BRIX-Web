import { useQuery } from '@tanstack/react-query';
import { algoliaClient, ALGOLIA_INDICES } from '@/lib/algolia';
import type { AlgoliaBrickRecord, AlgoliaUserRecord } from '@/types/algolia.types';

export type MapBounds = [number, number, number, number];

interface UseAlgoliaMapSearchParams {
    indexName: 'bricks' | 'users';
    bounds: MapBounds | null; // [nLat, nLng, sLat, sLng]
    limit?: number;
    filters?: string;
}

/**
 * Searches Algolia for hits strictly inside the current map viewport.
 * Avoids downloading the entire table coordinates locally.
 */
export function useAlgoliaMapSearch<T extends AlgoliaBrickRecord | AlgoliaUserRecord>({
    indexName,
    bounds,
    limit = 60,
    filters,
}: UseAlgoliaMapSearchParams) {
    return useQuery({
        queryKey: ['algoliaMapSearch', indexName, bounds, filters],
        queryFn: async () => {
            if (!bounds) return [];

            const [nLat, nLng, sLat, sLng] = bounds;
            const targetIndex =
                indexName === 'bricks' ? ALGOLIA_INDICES.BRICKS : ALGOLIA_INDICES.USERS;

            const response = await algoliaClient.search<T>({
                requests: [
                    {
                        indexName: targetIndex,
                        insideBoundingBox: [[nLat, nLng, sLat, sLng]],
                        hitsPerPage: limit,
                        filters: filters,
                    },
                ],
            });

            const result = response.results[0];
            if (result && 'hits' in result) {
                return result.hits;
            }
            return [];
        },
        enabled: !!bounds,
        staleTime: 5000,
    });
}
