'use client';

import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    useMap,
} from '@/components/ui/Map';
import { useEffect, useId } from 'react';

// Hardcoded user locations around the world
const userLocations = [
    { id: 1, city: 'Tokyo', country: 'Japan', lng: 139.6917, lat: 35.6895, users: 342 },
    { id: 2, city: 'New York', country: 'USA', lng: -74.006, lat: 40.7128, users: 528 },
    { id: 3, city: 'London', country: 'UK', lng: -0.1276, lat: 51.5074, users: 289 },
    { id: 4, city: 'Berlin', country: 'Germany', lng: 13.405, lat: 52.52, users: 156 },
    { id: 5, city: 'Singapore', country: 'Singapore', lng: 103.8198, lat: 1.3521, users: 203 },
    { id: 6, city: 'Sydney', country: 'Australia', lng: 151.2093, lat: -33.8688, users: 178 },
    { id: 7, city: 'São Paulo', country: 'Brazil', lng: -46.6333, lat: -23.5505, users: 245 },
    { id: 8, city: 'Dubai', country: 'UAE', lng: 55.2708, lat: 25.2048, users: 134 },
    { id: 9, city: 'Seoul', country: 'South Korea', lng: 126.978, lat: 37.5665, users: 312 },
    { id: 10, city: 'Paris', country: 'France', lng: 2.3522, lat: 48.8566, users: 267 },
    { id: 11, city: 'Mumbai', country: 'India', lng: 72.8777, lat: 19.076, users: 189 },
    { id: 12, city: 'Toronto', country: 'Canada', lng: -79.3832, lat: 43.6532, users: 145 },
];

// Pulsing marker for active nodes with glow effect
function PulsingMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'size-2',
        md: 'size-3',
        lg: 'size-4',
    };

    const glowSizes = {
        sm: 'shadow-[0_0_6px_#00eeff]',
        md: 'shadow-[0_0_10px_#00eeff]',
        lg: 'shadow-[0_0_14px_#00eeff]',
    };

    return (
        <div className="relative">
            {/* Pulse ring */}
            <div
                className={`absolute inset-0 ${sizeClasses[size]} bg-primary rounded-full animate-ping opacity-60`}
            />
            {/* Core with glow */}
            <div
                className={`relative ${sizeClasses[size]} bg-primary rounded-full border border-white/50 ${glowSizes[size]}`}
            />
        </div>
    );
}

// Live stream overlay component
function LiveStreamOverlay() {
    return (
        <div className="absolute top-4 left-4 p-4 bg-black/80 backdrop-blur-xl border border-border hidden lg:block z-10">
            <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-primary mb-3">
                Live Stream
            </h4>
            <div className="space-y-2">
                <div className="flex items-center gap-3 opacity-80">
                    <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-mono text-[9px]">User_8292 verified in Berlin</span>
                </div>
                <div className="flex items-center gap-3 opacity-80">
                    <div className="size-1.5 bg-secondary rounded-full"></div>
                    <span className="font-mono text-[9px]">New block mined: 0x921...F1</span>
                </div>
                <div className="flex items-center gap-3 opacity-80">
                    <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-mono text-[9px]">
                        Artist_Neo uploaded &quot;Neon_Rain&quot;
                    </span>
                </div>
            </div>
        </div>
    );
}

// Custom GeoJSON layer for connection lines between nodes
function ConnectionsLayer() {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `connections-${id}`;
    const layerId = `connections-layer-${id}`;

    useEffect(() => {
        if (!map || !isLoaded) return;

        // Create connection lines between nearby nodes
        const connections: GeoJSON.Feature<GeoJSON.LineString>[] = [];
        for (let i = 0; i < userLocations.length; i++) {
            for (let j = i + 1; j < userLocations.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(userLocations[i].lng - userLocations[j].lng, 2) +
                        Math.pow(userLocations[i].lat - userLocations[j].lat, 2),
                );
                // Only connect nodes within ~50 degrees distance
                if (dist < 50) {
                    connections.push({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [userLocations[i].lng, userLocations[i].lat],
                                [userLocations[j].lng, userLocations[j].lat],
                            ],
                        },
                    });
                }
            }
        }

        const geojson: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
            type: 'FeatureCollection',
            features: connections,
        };

        map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
        });

        map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': '#00eeff',
                'line-width': 0.5,
                'line-opacity': 0.2,
            },
        });

        return () => {
            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore cleanup errors
            }
        };
    }, [map, isLoaded, sourceId, layerId]);

    return null;
}

export function MapSection() {
    return (
        <section id="map" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="font-display text-4xl font-bold uppercase tracking-tight mb-2">
                            Real-Time <span className="text-secondary">Map</span>
                        </h2>
                        <p className="font-body text-muted-foreground">
                            Tracking global verifications in real-time.
                        </p>
                    </div>
                    <div className="flex gap-4 font-mono text-[10px]">
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full">
                            <div className="size-2 bg-primary rounded-full animate-ping"></div>
                            <span>1,204 LIVE NODES</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 border border-secondary/40 rounded-full">
                            <span>42 UPLOADS/MIN</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Map */}
                <div className="relative border-tech overflow-hidden">
                    <div className="aspect-21/9 relative">
                        <Map
                            center={[20, 30]}
                            zoom={1.5}
                            minZoom={1}
                            maxZoom={6}
                            scrollZoom={false}
                            dragRotate={false}
                            pitchWithRotate={false}
                        >
                            {/* Connection lines between nodes */}
                            <ConnectionsLayer />

                            {/* User location markers */}
                            {userLocations.map((location) => (
                                <MapMarker
                                    key={location.id}
                                    longitude={location.lng}
                                    latitude={location.lat}
                                >
                                    <MarkerContent>
                                        <PulsingMarker
                                            size={
                                                location.users > 300
                                                    ? 'lg'
                                                    : location.users > 200
                                                      ? 'md'
                                                      : 'sm'
                                            }
                                        />
                                    </MarkerContent>
                                    <MarkerTooltip>
                                        <div className="text-center">
                                            <p className="font-display font-bold text-xs">
                                                {location.city}
                                            </p>
                                            <p className="text-[10px] opacity-70">
                                                {location.users} active nodes
                                            </p>
                                        </div>
                                    </MarkerTooltip>
                                </MapMarker>
                            ))}

                            {/* Map Controls */}
                            <MapControls
                                position="bottom-right"
                                showZoom
                                showCompass
                                showFullscreen
                            />

                            {/* Live stream overlay */}
                            <LiveStreamOverlay />
                        </Map>
                    </div>
                </div>
            </div>
        </section>
    );
}
