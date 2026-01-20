'use client';

import { useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CornerBrackets, LocationPanel, HashPanel, CaptureButton } from '@/components/camera';

export default function CameraPage() {
    const {
        videoRef,
        isActive,
        isLoading: cameraLoading,
        error: cameraError,
        requestCamera,
        capture,
    } = useCamera();
    const {
        location,
        isLoading: locationLoading,
        error: locationError,
        requestLocation,
    } = useGeolocation();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Request permissions on mount
    useEffect(() => {
        requestCamera();
        requestLocation();
    }, [requestCamera, requestLocation]);

    const handleCapture = () => {
        const image = capture();
        if (image) {
            setCapturedImage(image);
            // TODO: Handle captured image (save, upload, etc.)
            console.log('Image captured!', { location, timestamp: Date.now() });
        }
    };

    const systemStatus = isActive
        ? 'SYSTEM READY: CAMERA_FEED_ACTIVE'
        : cameraLoading
          ? 'SYSTEM: LOADING_CAMERA_RESOURCE...'
          : cameraError
            ? 'SYSTEM ERROR: CAMERA_UNAVAILABLE'
            : 'SYSTEM: INITIALIZING...';

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center p-6 bg-background font-mono text-primary select-none overflow-hidden">
            {/* Camera Feed Background */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-80"
                />
                {/* Fallback when no camera */}
                {!isActive && (
                    <div className="absolute inset-0 bg-background flex items-center justify-center">
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">
                            {cameraError || 'Requesting camera access...'}
                        </p>
                    </div>
                )}
            </div>

            {/* CRT Scan Effect */}
            <div className="absolute inset-0 z-10 crt-scan pointer-events-none" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-linear-to-t from-background via-transparent to-background/40 pointer-events-none" />

            {/* Left Panel - Location Data (Desktop only) */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-48 hidden lg:flex flex-col gap-4">
                <LocationPanel
                    location={location}
                    isLoading={locationLoading}
                    error={locationError}
                />
            </div>

            {/* Right Panel - Hash Data (Desktop only) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-48 hidden lg:flex flex-col gap-4 items-end text-right">
                <HashPanel />
            </div>

            {/* Main Viewfinder */}
            <div className="relative w-full max-w-5xl aspect-video z-20 flex items-center justify-center">
                <CornerBrackets />

                {/* Crosshair */}
                <div className="relative opacity-30">
                    <div className="w-16 h-px bg-primary" />
                    <div className="h-16 w-px bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-6">
                {/* Status */}
                <div className="text-primary text-xs font-bold tracking-[0.3em] flex items-center gap-3">
                    <span
                        className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-destructive'}`}
                    />
                    {systemStatus}
                </div>

                {/* Capture Button */}
                <CaptureButton onClick={handleCapture} disabled={!isActive} />
            </div>

            {/* Bottom Footer Info */}
            <div className="absolute bottom-6 w-full px-12 flex justify-between items-center z-20 opacity-40 text-[9px] uppercase tracking-widest">
                <div className="flex gap-8">
                    <span>REC_MODE: STILL_CAPTURE</span>
                    <span>ENC: BRIX_SECURE_V1</span>
                </div>
                <div className="flex gap-8">
                    <span>VER: 4.0.22_STABLE</span>
                    <span>© BRIX_SYSTEMS</span>
                </div>
            </div>

            {/* Left Vertical Accent */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-20">
                <div className="w-px h-32 bg-primary" />
                <span className="vertical-text text-[8px] rotate-180">DEVICE_MAPPING_ON</span>
                <div className="w-px h-32 bg-primary" />
            </div>

            {/* Right Vertical Accent */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-20">
                <div className="w-px h-32 bg-primary" />
                <span className="vertical-text text-[8px]">STREAM_ID_0081</span>
                <div className="w-px h-32 bg-primary" />
            </div>

            {/* Captured Image Preview Modal */}
            {capturedImage && (
                <div
                    className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-8"
                    onClick={() => setCapturedImage(null)}
                >
                    <div className="max-w-4xl w-full border-2 border-primary p-4 bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={capturedImage} alt="Captured" className="w-full h-auto" />
                        <div className="mt-4 flex justify-between items-center text-xs">
                            <span>
                                LAT: {location.latitude?.toFixed(4) ?? '--'} | LNG:{' '}
                                {location.longitude?.toFixed(4) ?? '--'}
                            </span>
                            <span>TIMESTAMP: {location.timestamp ?? '--'}</span>
                        </div>
                        <button
                            className="mt-4 w-full py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCapturedImage(null);
                            }}
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
