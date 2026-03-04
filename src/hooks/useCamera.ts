'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';

interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    stream: MediaStream | null;
    isActive: boolean;
    isLoading: boolean;
    error: string | null;
    requestCamera: () => Promise<void>;
    capture: () => string | null;
    captureWithQR: (
        qrToken: string,
        coords?: { latitude: number; longitude: number },
    ) => Promise<Blob | null>;
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
     * Draw the BRIX diamond logo in the center of a QR canvas.
     * Uses a white circle background (~18% of QR area) so pyzbar
     * can still decode with ECC level H.
     */
    const drawLogoOnQR = useCallback(
        (ctx: CanvasRenderingContext2D, qrX: number, qrY: number, qrSize: number) => {
            const logoSize = Math.round(qrSize * 0.22); // ~18-20% area
            const centerX = qrX + qrSize / 2;
            const centerY = qrY + qrSize / 2;

            // White circle background (required for pyzbar readability)
            const circleR = logoSize * 0.6;
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleR, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // BRIX diamond: outer cyan diamond + inner dark square
            const half = logoSize / 2;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI / 4); // 45° rotation

            // Outer diamond (cyan)
            const outerHalf = half * 0.8;
            ctx.fillStyle = '#00EEFF';
            ctx.beginPath();
            ctx.roundRect(-outerHalf, -outerHalf, outerHalf * 2, outerHalf * 2, 1);
            ctx.fill();

            // Inner square (dark)
            const innerHalf = half * 0.32;
            ctx.fillStyle = '#050505';
            ctx.fillRect(-innerHalf, -innerHalf, innerHalf * 2, innerHalf * 2);

            ctx.restore();
        },
        [],
    );

    /**
     * Capture current frame with QR code embedded directly into canvas pixels.
     * The QR encodes the qrToken (base64 HMAC-signed JSON from BE).
     *
     * - Position: bottom-LEFT
     * - Size: 96×96px (with ECC H + BRIX logo center)
     * - Color: cyan #00EEFF on transparent, with dark bg pad
     * - Timestamp + coords: top-left (decorative)
     * - Export: JPEG 0.9 quality for upload
     *
     * Returns a Blob (JPEG) ready for upload.
     */
    const captureWithQR = useCallback(
        async (
            qrToken: string,
            coords?: { latitude: number; longitude: number },
        ): Promise<Blob | null> => {
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

            // ─── QR code overlay (bottom-LEFT) ───────────────────────
            const qrSize = 96;
            const qrMargin = 12;

            // Generate QR canvas with ECC level H for logo tolerance
            const qrCanvas = document.createElement('canvas');
            await QRCode.toCanvas(qrCanvas, qrToken, {
                errorCorrectionLevel: 'H',
                width: qrSize,
                margin: 1,
                color: {
                    dark: '#00EEFF', // cyan QR modules
                    light: '#00000000', // transparent background
                },
            });

            // Draw semi-transparent background pad behind QR
            const padX = qrMargin;
            const padY = canvas.height - qrSize - qrMargin;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padX - 4, padY - 4, qrSize + 8, qrSize + 8);

            // 1px border for visual clarity
            ctx.strokeStyle = 'rgba(0, 238, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(padX - 4, padY - 4, qrSize + 8, qrSize + 8);

            // Draw QR code onto main canvas
            ctx.drawImage(qrCanvas, padX, padY, qrSize, qrSize);

            // Draw BRIX logo in center of QR
            drawLogoOnQR(ctx, padX, padY, qrSize);

            // ─── Timestamp + coordinates watermark (top-LEFT, decorative) ──
            const timestamp = new Date().toISOString();
            const tsFontSize = Math.max(12, Math.floor(canvas.height * 0.018));
            ctx.font = `${tsFontSize}px monospace`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(0, 238, 255, 0.4)';
            ctx.fillText(timestamp, qrMargin, qrMargin);

            if (coords) {
                const coordText = `LAT ${coords.latitude.toFixed(6)}  LNG ${coords.longitude.toFixed(6)}`;
                ctx.fillText(coordText, qrMargin, qrMargin + tsFontSize + 4);
            }

            // Convert canvas to Blob (JPEG 0.9 to preserve QR quality)
            return new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
            });
        },
        [isActive, drawLogoOnQR],
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
        captureWithQR,
        stopCamera,
    };
}
