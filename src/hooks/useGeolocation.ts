'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface GeolocationData {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    accuracy: number | null;
    timestamp: number | null;
}

interface UseGeolocationReturn {
    location: GeolocationData;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => void;
    stopWatching: () => void;
}

const defaultLocation: GeolocationData = {
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    timestamp: null,
};

export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<GeolocationData>(defaultLocation);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
        });
        setIsLoading(false);
        setError(null);
    }, []);

    const handleError = useCallback((err: GeolocationPositionError) => {
        setIsLoading(false);
        switch (err.code) {
            case err.PERMISSION_DENIED:
                setError('GPS_ACCESS_DENIED: User rejected location permission');
                break;
            case err.POSITION_UNAVAILABLE:
                setError('GPS_UNAVAILABLE: Location information unavailable');
                break;
            case err.TIMEOUT:
                setError('GPS_TIMEOUT: Location request timed out');
                break;
            default:
                setError(`GPS_ERROR: ${err.message}`);
        }
    }, []);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('GPS_NOT_SUPPORTED: Geolocation is not supported by this browser');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Start watching position for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    }, [handleSuccess, handleError]);

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return {
        location,
        isLoading,
        error,
        requestLocation,
        stopWatching,
    };
}
