'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { X, ShieldCheck } from 'lucide-react';
import ReflectiveCard from '@/components/react-bits/ReflectiveCard';
import type { ArtistData } from '@/components/artist';
import { getAvatarUrl } from '@/utils/cloudinary';
import Image from 'next/image';

interface ArtistShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    artist: ArtistData;
}

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

export function ArtistShareModal({ isOpen, onClose, artist }: ArtistShareModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;

        const profileUrl = `${window.location.origin}/dashboard/artist/${artist.id}`;
        const cvs = canvasRef.current;

        QRCode.toCanvas(cvs, profileUrl, {
            errorCorrectionLevel: 'H',
            width: 90,
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
    }, [isOpen, artist.id]);

    // Use background if available, else avatar for the reflection
    const reflectionSource = artist.background || getAvatarUrl(artist.avatar, artist.gender);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative z-10 flex flex-col items-center gap-6"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
                        >
                            <X className="size-5" />
                        </button>

                        <ReflectiveCard
                            imageSrc={reflectionSource}
                            blurStrength={12}
                            roughness={0.5}
                            metalness={1.2}
                            displacementStrength={25}
                        >
                            <div className="flex flex-col h-full justify-between p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] px-2.5 py-1 bg-primary/20 text-primary rounded border border-primary/30 uppercase">
                                        <ShieldCheck className="size-3.5" />
                                        <span>BRIX ID</span>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-50 tracking-widest">
                                        {artist.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>

                                {/* Center Identity */}
                                <div className="flex flex-col items-center justify-center text-center gap-4 my-8">
                                    <div className="relative size-28 rounded-full border-2 border-primary/50 overflow-hidden shadow-[0_0_30px_rgba(0,238,255,0.3)] bg-background">
                                        <Image
                                            src={getAvatarUrl(artist.avatar, artist.gender)}
                                            alt={artist.username}
                                            fill
                                            className="object-cover"
                                            sizes="112px"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter uppercase drop-shadow-md pb-1 text-white">
                                            {undefined !== artist.fullName &&
                                            artist.fullName !== artist.username
                                                ? artist.fullName
                                                : artist.username}
                                        </h2>
                                        {artist.tagline && (
                                            <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] opacity-90 max-w-[200px] mx-auto leading-relaxed truncate">
                                                {artist.tagline}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer: QR & Stats */}
                                <div className="flex items-end justify-between border-t border-white/20 pt-4">
                                    <div className="flex flex-col gap-2 pb-1">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] tracking-[0.2em] opacity-60 uppercase">
                                                Alias
                                            </span>
                                            <span className="font-mono text-xs font-bold tracking-widest text-white">
                                                @{artist.username}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] tracking-[0.2em] opacity-60 uppercase">
                                                Trust Level
                                            </span>
                                            <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">
                                                {artist.trustScore}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="p-1 bg-white rounded-lg shadow-xl shrink-0 border-2 border-primary/20 glow-cyan">
                                        <canvas ref={canvasRef} className="block size-[80px]" />
                                    </div>
                                </div>
                            </div>
                        </ReflectiveCard>

                        {/* External Call to action below the card */}
                        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                            Scan to visit profile
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
