import { GeolocationData } from '@/hooks/useGeolocation';
import { DataStream } from '@/components/camera';

interface LocationPanelProps {
    location: GeolocationData;
    isLoading: boolean;
    error: string | null;
}

const GPS_DATA_STREAM = [
    'fetching_sat_link...',
    'signal_lock_stable',
    'NMEA_GGA_SENTENCE_RECV',
    'accuracy_0.42m',
    'HDOP_1.2',
    'VDOP_0.8',
    'GEOID_HEIGHT: 32.4',
    'STATION_ID: 0492',
    'RTK_FIX_ENABLED',
    'CALIBRATING_GYRO...',
];

export function LocationPanel({ location, isLoading, error }: LocationPanelProps) {
    const formatCoord = (val: number | null, dir: string) => {
        if (val === null) return '--';
        const abs = Math.abs(val);
        const suffix = val >= 0 ? dir[0] : dir[1];
        return `${abs.toFixed(4)}° ${suffix}`;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Location Data Box */}
            <div className="border-l-2 border-primary pl-4 py-2 bg-background/60 backdrop-blur-md">
                <div className="text-[10px] uppercase opacity-50 mb-1 tracking-widest font-bold">
                    Location_Data
                </div>
                <div className="text-xs space-y-1 text-primary font-mono">
                    {error ? (
                        <p className="text-destructive text-[9px]">{error}</p>
                    ) : isLoading ? (
                        <p className="animate-pulse">ACQUIRING_GPS...</p>
                    ) : (
                        <>
                            <p>LAT: {formatCoord(location.latitude, 'NS')}</p>
                            <p>LNG: {formatCoord(location.longitude, 'EW')}</p>
                            <p>ALT: {location.altitude?.toFixed(2) ?? '--'}M MSL</p>
                            <p>ACC: {location.accuracy?.toFixed(2) ?? '--'}M</p>
                        </>
                    )}
                </div>
            </div>

            {/* Data Stream */}
            <DataStream lines={[...GPS_DATA_STREAM, `EPOCH_TIME: ${location.timestamp ?? '--'}`]} />
        </div>
    );
}
