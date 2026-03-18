'use client';

import { useMemo } from 'react';
import {
    Map as MapComponent,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapControls,
} from '@/components/ui';
import { useGetNewsfeedLocations, useGetNewsfeedLocationsMe } from '@/hooks/apis/brick.api';
import { BrickTagType } from '@/types/brick.types';
import { PulsingMarker } from './PulsingMarker';
import { MapHoverCard } from './MapHoverCard';

interface DashboardMapProps {
    mapTab: 'GLOBAL' | 'ME';
    selectedTag: BrickTagType | 'ALL';
    onBrickSelect: (brickId: string) => void;
}

export function DashboardMap({ mapTab, selectedTag, onBrickSelect }: DashboardMapProps) {
    const filters = {
        isPublic: mapTab === 'GLOBAL' ? true : undefined,
        tagType: selectedTag === 'ALL' ? undefined : selectedTag,
    };

    const { data: globalLocations = [] } = useGetNewsfeedLocations(filters);
    const { data: myLocations = [] } = useGetNewsfeedLocationsMe(filters);

    const currentLocations = mapTab === 'GLOBAL' ? globalLocations : myLocations;

    // Scatter locations with exact same coordinates
    const scatteredLocations = useMemo(() => {
        const coordsMap = new Map<string, number>();
        return currentLocations.map((loc) => {
            const key = `${loc.latitude.toFixed(5)},${loc.longitude.toFixed(5)}`;
            const count = coordsMap.get(key) || 0;
            coordsMap.set(key, count + 1);

            if (count > 0) {
                // Offset roughly ~5 meters per overlapping item
                const offset = count * 0.00005;
                const angle = count * (Math.PI / 4);
                return {
                    ...loc,
                    latitude: loc.latitude + offset * Math.cos(angle),
                    longitude: loc.longitude + offset * Math.sin(angle),
                };
            }
            return loc;
        });
    }, [currentLocations]);

    return (
        <MapComponent center={[0, 20]} zoom={2} minZoom={1.5} maxZoom={18}>
            {scatteredLocations.map((node) => (
                <MapMarker
                    key={node.id}
                    longitude={node.longitude}
                    latitude={node.latitude}
                    onClick={() => onBrickSelect(node.id)}
                >
                    <MarkerContent>
                        <PulsingMarker size="md" />
                    </MarkerContent>
                    <MarkerTooltip
                        className="p-0 border-none bg-transparent shadow-none"
                        offset={15}
                    >
                        <MapHoverCard brickId={node.id} />
                    </MarkerTooltip>
                </MapMarker>
            ))}
            <MapControls position="bottom-right" showZoom showLocate showFullscreen />
        </MapComponent>
    );
}
