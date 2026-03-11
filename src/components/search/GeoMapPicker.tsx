'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls } from '@/components/ui/Map';

export interface GeoMapPickerProps {
    center: [number, number];
    markerPos: { lat: number; lng: number } | null;
    zoom: number;
    onPick: (lat: number, lng: number) => void;
}

export function GeoMapPicker({ center, markerPos, zoom, onPick }: GeoMapPickerProps) {
    const mapRef = useRef<import('@/components/ui/Map').MapRef | null>(null);

    // Attach a click listener to the MapLibre instance via imperative ref
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleClick = (e: { lngLat: { lat: number; lng: number } }) => {
            onPick(e.lngLat.lat, e.lngLat.lng);
        };

        // MapLibre GL fires 'click' events
        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [onPick]);

    return (
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-primary/20 shadow-[0_0_20px_rgba(0,238,255,0.1)] cursor-crosshair">
            <Map ref={mapRef} zoom={zoom} center={center} theme="dark">
                {markerPos && (
                    <MapMarker longitude={markerPos.lng} latitude={markerPos.lat}>
                        <MarkerContent>
                            <div className="size-5 rounded-full bg-primary shadow-[0_0_15px_rgba(0,238,255,0.8)] flex items-center justify-center animate-pulse">
                                <MapPin className="size-3 text-background" />
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}
                <MapControls position="bottom-right" showZoom />
            </Map>
            {!markerPos && (
                <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground">
                        Click to set search center
                    </div>
                </div>
            )}
        </div>
    );
}
