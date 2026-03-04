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
    captureWithNonce: (nonce: string) => Promise<Blob | null>;
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

    /**
     * Capture current frame with nonce text embedded directly into canvas pixels.
     * Optimized for backend OCR verification:
     * - Prefix: "BRX-" + nonce (e.g. "BRX-A91DFK")
     * - Position: bottom-LEFT, fixed ROI
     * - Font: bold monospace, cyan #00EEFF on semi-transparent black bg
     * - Timestamp: top-left (decorative, not validated by BE)
     *
     * Backend ROI crop guide:
     *   roiWidth  = canvas.width * 0.35
     *   roiHeight = canvas.height * 0.12
     *   roi = { x: 0, y: canvas.height - roiHeight, width: roiWidth, height: roiHeight }
     *
     * Returns a Blob (PNG) ready for upload.
     */
    const captureWithNonce = useCallback(
        async (nonce: string): Promise<Blob | null> => {
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

            // Draw the video frame
            ctx.drawImage(video, 0, 0);

            // ─── Nonce overlay (bottom-LEFT, OCR-optimized) ───────────
            // Fixed font size: ~4% of canvas height, min 24px
            const fontSize = Math.max(24, Math.floor(canvas.height * 0.04));
            const padding = fontSize * 0.6;

            // Nonce text as-is (BE already includes "BRX-" prefix)
            const nonceText = nonce;

            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textBaseline = 'bottom';
            const textMetrics = ctx.measureText(nonceText);
            const textWidth = textMetrics.width;

            // ROI box dimensions (fixed region for BE to crop)
            const boxWidth = textWidth + padding * 2;
            const boxHeight = fontSize + padding * 2;
            const boxX = padding; // bottom-LEFT
            const boxY = canvas.height - boxHeight - padding;

            // Semi-transparent background for contrast isolation
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // 1px border for visual clarity
            ctx.strokeStyle = 'rgba(0, 238, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Nonce text — cyan monospace
            ctx.fillStyle = '#00EEFF';
            ctx.fillText(nonceText, boxX + padding, boxY + boxHeight - padding);

            // ─── Timestamp watermark (top-LEFT, decorative) ──────────
            const timestamp = new Date().toISOString();
            const tsFontSize = Math.floor(fontSize * 0.45);
            ctx.font = `${tsFontSize}px monospace`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(0, 238, 255, 0.4)';
            ctx.fillText(timestamp, padding, padding);

            // Convert canvas to Blob
            return new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
            });
        },
        [isActive],
    );

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
        captureWithNonce,
        stopCamera,
    };
}
