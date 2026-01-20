'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    stream: MediaStream | null;
    isActive: boolean;
    isLoading: boolean;
    error: string | null;
    requestCamera: () => Promise<void>;
    capture: () => string | null;
    stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync stream with video element whenever stream changes
    useEffect(() => {
        console.log('[useCamera] Stream effect triggered', {
            stream: !!stream,
            videoRef: !!videoRef.current,
        });
        if (stream && videoRef.current) {
            console.log('[useCamera] Setting srcObject on video element');
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                console.log('[useCamera] Video metadata loaded, attempting to play');
                videoRef.current
                    ?.play()
                    .then(() => {
                        console.log('[useCamera] Video playing successfully');
                        setIsActive(true);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error('[useCamera] Video play failed:', err);
                        setError(`CAMERA_PLAY_ERROR: ${err.message}`);
                        setIsLoading(false);
                    });
            };
            videoRef.current.onerror = (e) => {
                console.error('[useCamera] Video element error:', e);
            };
        }
    }, [stream]);

    const requestCamera = useCallback(async () => {
        console.log('[useCamera] requestCamera called');

        const tryGetCamera = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
            console.log('[useCamera] Trying constraints:', JSON.stringify(constraints));
            return await navigator.mediaDevices.getUserMedia(constraints);
        };

        try {
            setError(null);
            setIsLoading(true);

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices?.getUserMedia) {
                console.error('[useCamera] getUserMedia not supported');
                throw new Error('Camera API not supported in this browser');
            }

            let mediaStream: MediaStream | null = null;

            // Try different constraints in order of preference (simplest first)
            const constraintOptions: MediaStreamConstraints[] = [
                { video: true, audio: false },
                { video: { facingMode: 'user' }, audio: false },
                { video: { facingMode: 'environment' }, audio: false },
            ];

            for (const constraints of constraintOptions) {
                try {
                    mediaStream = await tryGetCamera(constraints);
                    console.log(
                        '[useCamera] Success with constraints:',
                        JSON.stringify(constraints),
                    );
                    break;
                } catch (e) {
                    console.warn(
                        '[useCamera] Failed with constraints:',
                        JSON.stringify(constraints),
                        e,
                    );
                }
            }

            if (!mediaStream) {
                throw new Error('Could not access camera with any constraint option');
            }

            console.log('[useCamera] MediaStream obtained:', mediaStream);
            console.log(
                '[useCamera] Video tracks:',
                mediaStream.getVideoTracks().map((t) => ({
                    id: t.id,
                    label: t.label,
                    enabled: t.enabled,
                    readyState: t.readyState,
                })),
            );
            setStream(mediaStream);
            console.log('[useCamera] Stream state set');
        } catch (err) {
            console.error('[useCamera] Error:', err);
            setIsLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
            const errorName = err instanceof Error ? err.name : '';

            if (
                errorMessage.includes('Permission denied') ||
                errorMessage.includes('NotAllowedError') ||
                errorName === 'NotAllowedError'
            ) {
                setError('CAMERA_ACCESS_DENIED: User rejected camera permission');
            } else if (
                errorMessage.includes('NotFoundError') ||
                errorMessage.includes('DevicesNotFoundError') ||
                errorName === 'NotFoundError'
            ) {
                setError('CAMERA_NOT_FOUND: No camera device detected');
            } else if (
                errorMessage.includes('NotReadableError') ||
                errorName === 'NotReadableError'
            ) {
                setError('CAMERA_IN_USE: Camera is being used by another application');
            } else if (
                errorMessage.includes('OverconstrainedError') ||
                errorName === 'OverconstrainedError'
            ) {
                setError('CAMERA_CONSTRAINT_ERROR: Camera does not support requested settings');
            } else if (errorMessage.includes('AbortError') || errorName === 'AbortError') {
                setError(
                    'CAMERA_TIMEOUT: Camera took too long to start. Try closing other apps using camera.',
                );
            } else {
                setError(`CAMERA_ERROR: ${errorMessage}`);
            }
            setIsActive(false);
        }
    }, []);

    const capture = useCallback((): string | null => {
        if (!videoRef.current || !isActive) return null;

        const video = videoRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Video not ready for capture');
            return null;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/png');
    }, [isActive]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setIsActive(false);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    return {
        videoRef,
        stream,
        isActive,
        isLoading,
        error,
        requestCamera,
        capture,
        stopCamera,
    };
}
