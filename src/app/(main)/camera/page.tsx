'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPinOff } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCreateRealtimeSession, useUploadRealtimeBrick } from '@/hooks/apis/brick.api';
import { useRealtimeSessionStore } from '@/stores/realtime-session-store';
import { useUIStore } from '@/stores/ui-store';
import { useSwal } from '@/hooks/useSwal';
import { ConfirmPopup } from '@/components/shared';
import {
    CornerBrackets,
    LocationPanel,
    HashPanel,
    CaptureButton,
    QROverlay,
    SessionCountdown,
    FormCountdown,
    RealtimeUploadForm,
} from '@/components/camera';
import type { UploadRealtimeBrickFormInput } from '@/validations/brick';

export default function CameraPage() {
    const router = useRouter();
    const swal = useSwal();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    const {
        videoRef,
        isActive,
        isLoading: cameraLoading,
        error: cameraError,
        requestCamera,
        captureWithQR,
        stopCamera,
    } = useCamera();
    const {
        location,
        isLoading: locationLoading,
        error: locationError,
        requestLocation,
    } = useGeolocation();

    // Realtime session store
    const {
        sessionId,
        qrToken,
        countdown,
        status,
        error: sessionError,
        capturedBlob,
        capturedPreview,
        startSession,
        setRequesting,
        setCapturing,
        setCapturedImage,
        setUploading,
        setSuccess,
        setError,
        retakePhoto,
        reset: resetSession,
    } = useRealtimeSessionStore();

    // API hooks
    const createSession = useCreateRealtimeSession();
    const uploadRealtime = useUploadRealtimeBrick();

    // Confirm cancel state
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Location availability check
    const hasLocation = location.latitude != null && location.longitude != null;
    const locationDenied = locationError?.startsWith('GPS_ACCESS_DENIED');

    // Request permissions on mount
    useEffect(() => {
        requestCamera();
        requestLocation();
    }, [requestCamera, requestLocation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            resetSession();
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Step 1: Request a realtime session ───────────────────────
    const handleStartSession = useCallback(async () => {
        if (!hasLocation) {
            swal.error(
                'Location Required',
                'Please enable Location in your browser settings to use Realtime Capture.',
            );
            return;
        }

        try {
            setRequesting();
            const data = await createSession.mutateAsync();
            startSession(data.sessionId, data.qrToken, data.expiresIn);
        } catch {
            setError('Failed to create capture session.');
            swal.error('Session Error', 'Failed to create capture session. Please try again.');
        }
    }, [hasLocation, createSession, startSession, setRequesting, setError, swal]);

    // ─── Step 2: Capture photo with QR embedded ──────────────────
    const handleCapture = useCallback(async () => {
        if (!qrToken || status !== 'active') return;

        setCapturing();
        const coords =
            location.latitude != null && location.longitude != null
                ? { latitude: location.latitude, longitude: location.longitude }
                : undefined;
        const blob = await captureWithQR(qrToken, coords);

        if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            setCapturedImage(blob, previewUrl);
        } else {
            setError('Failed to capture image. Please try again.');
        }
    }, [qrToken, status, location, captureWithQR, setCapturing, setCapturedImage, setError]);

    // ─── Step 3: Upload captured image ────────────────────────────
    const handleUpload = useCallback(
        async (formData: UploadRealtimeBrickFormInput) => {
            if (!capturedBlob || !sessionId) return;

            try {
                setUploading();
                showLoading('Uploading realtime brick...');
                await uploadRealtime.mutateAsync({
                    file: capturedBlob,
                    sessionId,
                    title: formData.title,
                    description: formData.description,
                    address: formData.address,
                    latitude: formData.latitude ?? location.latitude,
                    longitude: formData.longitude ?? location.longitude,
                    isPublic: formData.isPublic,
                });
                setSuccess();
                swal.success(
                    'Photo Queued!',
                    'Your photo is being processed. It will appear in your gallery shortly.',
                );
                resetSession();
                router.push('/dashboard');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                setError('Upload failed.');
                swal.error(
                    'Upload Failed',
                    error?.response?.data?.message || 'Session may have expired. Please try again.',
                );
            } finally {
                hideLoading();
            }
        },
        [
            capturedBlob,
            sessionId,
            location,
            uploadRealtime,
            setUploading,
            setSuccess,
            setError,
            resetSession,
            router,
            swal,
            showLoading,
            hideLoading,
        ],
    );

    // ─── Retry: request new session ───────────────────────────────
    const handleRetry = useCallback(() => {
        resetSession();
        handleStartSession();
    }, [resetSession, handleStartSession]);

    // ─── Cancel upload: confirm then retake ───────────────────────
    const handleCancelUpload = useCallback(() => {
        setShowCancelConfirm(true);
    }, []);

    const handleConfirmCancel = useCallback(() => {
        setShowCancelConfirm(false);
        retakePhoto();
    }, [retakePhoto]);

    // ─── Status text ──────────────────────────────────────────────
    const systemStatus = (() => {
        switch (status) {
            case 'idle':
                return isActive
                    ? 'SYSTEM READY: AWAITING_SESSION'
                    : cameraLoading
                      ? 'SYSTEM: LOADING_CAMERA_RESOURCE...'
                      : cameraError
                        ? 'SYSTEM ERROR: CAMERA_UNAVAILABLE'
                        : 'SYSTEM: INITIALIZING...';
            case 'requesting':
                return 'SYSTEM: REQUESTING_SESSION...';
            case 'active':
                return `SESSION_ACTIVE: QR_READY | TTL_${countdown}s`;
            case 'capturing':
                return capturedPreview
                    ? `CAPTURE_COMPLETE: FORM_TTL_${countdown}s`
                    : 'SYSTEM: PROCESSING_CAPTURE...';
            case 'uploading':
                return 'SYSTEM: UPLOADING_TO_QUEUE...';
            case 'success':
                return 'UPLOAD_QUEUED: PROCESSING_ASYNC...';
            case 'expired':
                return 'SESSION_EXPIRED: REQUEST_NEW_SESSION';
            case 'error':
                return `SYSTEM ERROR: ${sessionError ?? 'UNKNOWN'}`;
            default:
                return 'SYSTEM: UNKNOWN_STATE';
        }
    })();

    const canCapture = isActive && status === 'active' && countdown > 0;
    const showCapturePreview =
        (status === 'capturing' || status === 'uploading' || status === 'expired') &&
        capturedPreview;

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center p-6 bg-background font-mono text-primary select-none overflow-hidden">
            {/* Back to Dashboard */}
            <Link
                href="/dashboard"
                className="absolute top-6 left-6 z-30 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
            >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* Location Denied Banner */}
            {!hasLocation && !locationLoading && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-full">
                    <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/40 px-4 py-3 rounded-sm backdrop-blur-sm">
                        <MapPinOff className="size-5 text-destructive shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-destructive uppercase tracking-wider">
                                {locationDenied
                                    ? 'Location permission denied'
                                    : locationError || 'Location unavailable'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Please enable Location in your browser settings to use this feature.
                            </p>
                        </div>
                    </div>
                </div>
            )}
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

            {/* QR Overlay (top-right) */}
            <QROverlay />

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
                        className={`w-2 h-2 rounded-full ${
                            status === 'active'
                                ? 'bg-primary animate-pulse'
                                : status === 'error' || status === 'expired'
                                  ? 'bg-destructive'
                                  : status === 'uploading' || status === 'requesting'
                                    ? 'bg-secondary animate-pulse'
                                    : status === 'success'
                                      ? 'bg-primary'
                                      : isActive
                                        ? 'bg-primary'
                                        : 'bg-destructive'
                        }`}
                    />
                    <span className="max-w-xs sm:max-w-md truncate text-center">
                        {systemStatus}
                    </span>
                </div>

                {/* Session Countdown (when active) */}
                {status === 'active' && <SessionCountdown />}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    {/* IDLE: Start Session button */}
                    {status === 'idle' && isActive && (
                        <button
                            onClick={handleStartSession}
                            disabled={!hasLocation}
                            className="glow-button px-6 py-3 bg-linear-to-r from-primary to-secondary text-primary-foreground font-bold uppercase tracking-widest text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:from-muted disabled:to-muted disabled:text-muted-foreground"
                        >
                            {!hasLocation && locationLoading
                                ? 'Acquiring Location...'
                                : !hasLocation
                                  ? 'Location Required'
                                  : 'Start Capture Session'}
                        </button>
                    )}

                    {/* ACTIVE: Capture button */}
                    {status === 'active' && (
                        <CaptureButton onClick={handleCapture} disabled={!canCapture} />
                    )}

                    {/* EXPIRED / ERROR: Retry button */}
                    {(status === 'expired' || status === 'error') && (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 border border-border text-muted-foreground font-bold uppercase tracking-widest text-xs hover:text-primary hover:border-primary/40 transition-all"
                        >
                            {status === 'expired' ? 'New Session' : 'Retry'}
                        </button>
                    )}

                    {/* REQUESTING: Loading indicator */}
                    {status === 'requesting' && (
                        <div className="px-6 py-3 border border-border text-secondary font-bold uppercase tracking-widest text-xs animate-pulse">
                            Creating session...
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="absolute bottom-6 w-full px-12 flex justify-between items-center z-20 opacity-40 text-[9px] uppercase tracking-widest">
                <div className="flex gap-8">
                    <span>REC_MODE: REALTIME_CAPTURE</span>
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

            {/* ═══ Captured Image Preview + Upload Form Modal ═══ */}
            {showCapturePreview && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-6xl w-full space-y-6">
                        {/* Top bar: Back to Dashboard + Cancel Upload */}
                        <div className="flex items-center justify-between">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={handleCancelUpload}
                                disabled={status === 'uploading'}
                                className="px-4 py-2 border border-destructive/40 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Cancel Upload
                            </button>
                        </div>

                        {/* Form-phase countdown */}
                        <FormCountdown />

                        {/* Expired overlay during form phase */}
                        {status === 'expired' && (
                            <div className="bg-destructive/10 border border-destructive/40 rounded-sm p-6 text-center space-y-3">
                                <p className="text-destructive text-sm font-bold uppercase tracking-widest">
                                    Session Expired
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Your upload time has run out. Please start a new capture
                                    session.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    className="px-6 py-2 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors"
                                >
                                    New Session
                                </button>
                            </div>
                        )}

                        {/* Captured Image + Retake */}
                        {status !== 'expired' && (
                            <>
                                <div className="glitch-border p-3 bg-background max-w-2xl mx-auto">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={capturedPreview}
                                        alt="Captured"
                                        className="w-full h-auto"
                                    />
                                    <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                                        <span>
                                            LAT: {location.latitude?.toFixed(4) ?? '--'} | LNG:{' '}
                                            {location.longitude?.toFixed(4) ?? '--'}
                                        </span>
                                        <span className="text-primary neon-glow-text">
                                            SESSION: {sessionId?.slice(0, 8)}...
                                        </span>
                                    </div>

                                    {/* Retake button */}
                                    <button
                                        type="button"
                                        onClick={retakePhoto}
                                        disabled={status === 'uploading'}
                                        className="mt-3 w-full py-2 border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Retake Photo
                                    </button>
                                </div>

                                {/* Upload Form with embedded Preview Card */}
                                <RealtimeUploadForm
                                    onSubmit={handleUpload}
                                    isSubmitting={status === 'uploading'}
                                    defaultLatitude={location.latitude}
                                    defaultLongitude={location.longitude}
                                    capturedPreviewUrl={capturedPreview}
                                    sessionId={sessionId}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ Cancel Upload Confirm Popup ═══ */}
            <ConfirmPopup
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={handleConfirmCancel}
                type="warning"
                title="Cancel Upload?"
                message="Are you sure you want to discard this photo and go back to capture? Your current photo and form data will be lost."
                confirmText="Discard & Retake"
                cancelText="Keep Editing"
            />

            {/* ═══ Success Overlay ═══ */}
            {status === 'success' && (
                <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="text-6xl text-primary neon-glow-text">✓</div>
                        <p className="text-primary font-bold uppercase tracking-widest text-lg neon-glow-text">
                            Photo Queued Successfully
                        </p>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                            Your brick is being processed asynchronously...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
