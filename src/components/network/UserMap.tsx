'use client';

import { useMemo, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { useAlgoliaMapSearch, type MapBounds } from '@/hooks/apis/algolia.api';
import type { AlgoliaUserRecord } from '@/types/algolia.types';
import { AlgoliaUserCard } from '@/components/search/AlgoliaUserCard';
import {
    Map as MapComponent,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapControls,
    MapBoundsListener,
} from '@/components/ui';

// Pulsing marker for user dots
function UserPulsingMarker() {
    return (
        <div className="relative">
            <div className="absolute inset-0 size-3 bg-primary rounded-full animate-ping opacity-75" />
            <div className="relative size-3 bg-primary rounded-full border border-background shadow-[0_0_8px_#00eeff]" />
        </div>
    );
}

export function UserMap() {
    const [bounds, setBounds] = useState<MapBounds | null>(null);
    const { data: hits = [] } = useAlgoliaMapSearch<AlgoliaUserRecord>({
        indexName: 'users',
        bounds,
        limit: 100,
    });

    // Sub-filter only those that physically actually have a geoloc
    const geoHits = useMemo(() => hits.filter((h) => !!h._geoloc), [hits]);

    // Scatter locations with exact same coordinates
    const scatteredLocations = useMemo(() => {
        const coordsMap = new Map<string, number>();
        return geoHits.map((hit) => {
            const loc = hit._geoloc!;
            const key = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
            const count = coordsMap.get(key) || 0;
            coordsMap.set(key, count + 1);

            if (count > 0) {
                // Offset roughly ~5 meters per overlapping item
                const offset = count * 0.00005;
                const angle = count * (Math.PI / 4);
                return {
                    ...hit,
                    _geoloc: {
                        lat: loc.lat + offset * Math.cos(angle),
                        lng: loc.lng + offset * Math.sin(angle),
                    },
                };
            }
            return hit;
        });
    }, [geoHits]);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <MapIcon className="size-5 text-primary" />
                    Global Explorers
                </h2>
            </div>
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <MapComponent center={[0, 20]} zoom={2} minZoom={1.5} maxZoom={18}>
                    {scatteredLocations.map((node) => (
                        <MapMarker
                            key={node.objectID}
                            longitude={node._geoloc!.lng}
                            latitude={node._geoloc!.lat}
                        >
                            <MarkerContent>
                                <UserPulsingMarker />
                            </MarkerContent>
                            <MarkerTooltip
                                className="p-0 border-none bg-transparent shadow-none"
                                offset={15}
                            >
                                <AlgoliaUserCard hit={node} className="w-64" />
                            </MarkerTooltip>
                        </MapMarker>
                    ))}
                    <MapControls position="bottom-right" showZoom showLocate showFullscreen />
                    <MapBoundsListener onChange={setBounds} />
                </MapComponent>
            </div>
        </section>
    );
}
