'use client';

import { Navigation } from 'lucide-react';
import { Input } from '@/components/ui';

interface GeoLocationFieldsProps {
    latitude: number | null | undefined;
    longitude: number | null | undefined;
    onLatitudeChange: (value: number | null) => void;
    onLongitudeChange: (value: number | null) => void;
    latitudeError?: string;
    longitudeError?: string;
    gpsLocked?: boolean;
    disabled?: boolean;
}

export function GeoLocationFields({
    latitude,
    longitude,
    onLatitudeChange,
    onLongitudeChange,
    latitudeError,
    longitudeError,
    gpsLocked,
    disabled,
}: GeoLocationFieldsProps) {
    return (
        <div className="space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Navigation className="size-4 text-secondary" />
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase">Geo Coordinates</h3>
                <div className="flex-1" />
                {gpsLocked && (
                    <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                        GPS_LOCKED
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    leftIcon={<Navigation className="size-4" />}
                    variant="compact"
                    placeholder="-90 to 90"
                    error={latitudeError}
                    disabled={disabled}
                    value={latitude ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onLatitudeChange(val === '' ? null : parseFloat(val));
                    }}
                />

                <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    leftIcon={<Navigation className="size-4" />}
                    variant="compact"
                    placeholder="-180 to 180"
                    error={longitudeError}
                    disabled={disabled}
                    value={longitude ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onLongitudeChange(val === '' ? null : parseFloat(val));
                    }}
                />
            </div>
        </div>
    );
}
