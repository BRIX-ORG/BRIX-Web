'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useRealtimeSessionStore } from '@/stores/realtime-session-store';

/**
 * Draw the BRIX diamond logo in the center of a QR code on a canvas.
 */
function drawLogoOnCanvas(ctx: CanvasRenderingContext2D, size: number) {
    const centerX = size / 2;
    const centerY = size / 2;
    const logoSize = Math.round(size * 0.22);

    // White circle background
    const circleR = logoSize * 0.6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // BRIX diamond: outer cyan + inner dark
    const half = logoSize / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4);

    const outerHalf = half * 0.8;
    ctx.fillStyle = '#00EEFF';
    ctx.beginPath();
    ctx.roundRect(-outerHalf, -outerHalf, outerHalf * 2, outerHalf * 2, 1);
    ctx.fill();

    const innerHalf = half * 0.32;
    ctx.fillStyle = '#050505';
    ctx.fillRect(-innerHalf, -innerHalf, innerHalf * 2, innerHalf * 2);

    ctx.restore();
}

/**
 * Displays a live QR preview in the camera viewfinder so the user
 * knows what will be embedded into the captured image.
 */
export function QROverlay() {
    const { qrToken, status } = useRealtimeSessionStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!qrToken || !canvasRef.current) return;

        const cvs = canvasRef.current;

        QRCode.toCanvas(cvs, qrToken, {
            errorCorrectionLevel: 'H',
            width: 60,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        })
            .then(() => {
                const ctx = cvs.getContext('2d');
                if (ctx) drawLogoOnCanvas(ctx, cvs.width);
            })
            .catch(console.error);
    }, [qrToken]);

    if (!qrToken || (status !== 'active' && status !== 'capturing')) return null;

    return (
        <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
            {/* QR Badge */}
            <div className="border border-primary/60 bg-background/80 backdrop-blur-md p-2.5 glow-cyan">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1 font-bold text-center">
                    Challenge QR
                </div>
                <canvas ref={canvasRef} className="block" />
            </div>

            {/* Instruction */}
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground max-w-40 text-right">
                QR will be embedded into image pixels on capture
            </div>
        </div>
    );
}
