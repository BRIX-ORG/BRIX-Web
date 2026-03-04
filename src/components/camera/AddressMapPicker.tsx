'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Map, useMap, MapMarker, MarkerContent, MapControls } from '@/components/ui';
import { cn } from '@/utils/classnames';

const MAX_PICK_DISTANCE_KM = 5;

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Inner component that registers map events via useMap() ──────
function MapEventHandler({
    originLatitude,
    originLongitude,
    disabled,
    onPick,
    onPickTooFar,
    onHover,
    onHoverEnd,
}: {
    originLatitude: number;
    originLongitude: number;
    disabled?: boolean;
    onPick: (lat: number, lon: number) => void;
    onPickTooFar?: (distance: number) => void;
    onHover: (lat: number, lng: number) => void;
    onHoverEnd: () => void;
}) {
    const { map } = useMap();

    useEffect(() => {
        if (!map || disabled) return;

        map.getCanvas().style.cursor = 'crosshair';

        const handleClick = (e: maplibregl.MapMouseEvent) => {
            const { lat, lng } = e.lngLat;
            const distance = haversineDistanceKm(originLatitude, originLongitude, lat, lng);

            if (distance > MAX_PICK_DISTANCE_KM) {
                onPickTooFar?.(distance);
                return;
            }
            onPick(lat, lng);
        };

        const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
            onHover(e.lngLat.lat, e.lngLat.lng);
        };

        const handleMouseLeave = () => {
            onHoverEnd();
        };

        map.on('click', handleClick);
        map.on('mousemove', handleMouseMove);
        map.getCanvas().addEventListener('mouseleave', handleMouseLeave);

        return () => {
            map.off('click', handleClick);
            map.off('mousemove', handleMouseMove);
            map.getCanvas().removeEventListener('mouseleave', handleMouseLeave);
            map.getCanvas().style.cursor = '';
        };
    }, [map, disabled, originLatitude, originLongitude, onPick, onPickTooFar, onHover, onHoverEnd]);

    return null;
}

// ─── Main component ──────────────────────────────────────────────
interface AddressMapPickerProps {
    /** GPS-locked latitude from capture */
    originLatitude: number;
    /** GPS-locked longitude from capture */
    originLongitude: number;
    /** Marker latitude (may differ from origin when user picks) */
    pickedLatitude: number | null;
    /** Marker longitude (may differ from origin when user picks) */
    pickedLongitude: number | null;
    /** Called when user picks a valid location on the map */
    onPick: (lat: number, lon: number) => void;
    /** Called when the pick is too far */
    onPickTooFar?: (distance: number) => void;
    disabled?: boolean;
    className?: string;
}

export function AddressMapPicker({
    originLatitude,
    originLongitude,
    pickedLatitude,
    pickedLongitude,
    onPick,
    onPickTooFar,
    disabled,
    className,
}: AddressMapPickerProps) {
    const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number } | null>(null);

    const markerLat = pickedLatitude ?? originLatitude;
    const markerLng = pickedLongitude ?? originLongitude;

    const handleHover = useCallback((lat: number, lng: number) => {
        setHoveredCoords({ lat, lng });
    }, []);

    const handleHoverEnd = useCallback(() => {
        setHoveredCoords(null);
    }, []);

    const hoverDistance = useMemo(() => {
        if (!hoveredCoords) return null;
        return haversineDistanceKm(
            originLatitude,
            originLongitude,
            hoveredCoords.lat,
            hoveredCoords.lng,
        );
    }, [hoveredCoords, originLatitude, originLongitude]);

    const hoverIsValid = hoverDistance != null && hoverDistance <= MAX_PICK_DISTANCE_KM;

    return (
        <div className={cn('space-y-2', className)}>
            {/* Map header */}
            <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Pick on Map
                </label>
                {hoveredCoords && (
                    <span
                        className={cn(
                            'text-[9px] font-mono uppercase tracking-wider',
                            hoverIsValid ? 'text-primary' : 'text-destructive',
                        )}
                    >
                        {hoverDistance!.toFixed(2)} km{' '}
                        {hoverIsValid ? '— within range' : '— too far'}
                    </span>
                )}
            </div>

            {/* Map container */}
            <div
                className={cn(
                    'relative w-full h-64 border border-border rounded-sm overflow-hidden',
                    disabled && 'opacity-50 pointer-events-none',
                )}
            >
                <Map center={[originLongitude, originLatitude]} zoom={14}>
                    <MapEventHandler
                        originLatitude={originLatitude}
                        originLongitude={originLongitude}
                        disabled={disabled}
                        onPick={onPick}
                        onPickTooFar={onPickTooFar}
                        onHover={handleHover}
                        onHoverEnd={handleHoverEnd}
                    />

                    <MapControls position="bottom-right" showZoom />

                    {/* Origin marker (fixed GPS point) */}
                    <MapMarker longitude={originLongitude} latitude={originLatitude}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center">
                                {/* Pulse ring */}
                                <div className="absolute size-6 rounded-full bg-primary/20 animate-ping" />
                                <div className="relative size-3 rounded-full bg-primary border-2 border-primary-foreground shadow-[0_0_10px_rgba(0,238,255,0.6)]" />
                            </div>
                        </MarkerContent>
                    </MapMarker>

                    {/* Picked marker (only when different from origin) */}
                    {pickedLatitude != null &&
                        pickedLongitude != null &&
                        (pickedLatitude !== originLatitude ||
                            pickedLongitude !== originLongitude) && (
                            <MapMarker longitude={pickedLongitude} latitude={pickedLatitude}>
                                <MarkerContent>
                                    <div className="flex flex-col items-center">
                                        <MapPin className="size-6 text-secondary drop-shadow-[0_0_6px_rgba(188,0,255,0.8)]" />
                                    </div>
                                </MarkerContent>
                            </MapMarker>
                        )}
                </Map>

                {/* Coordinate badge */}
                <div className="absolute bottom-2 left-2 z-10 bg-background/80 backdrop-blur-sm border border-border px-2 py-1 rounded-sm">
                    <p className="text-[9px] font-mono text-primary">
                        {markerLat.toFixed(4)}, {markerLng.toFixed(4)}
                    </p>
                </div>
            </div>

            <p className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">
                Click on the map to pick a nearby address (max {MAX_PICK_DISTANCE_KM} km from
                capture point).
            </p>
        </div>
    );
}
