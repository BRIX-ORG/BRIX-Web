'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useTranslations } from 'next-intl';

// Generate fake hash from image URL
function generateHash(src: string): string {
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
        hash = (hash << 5) - hash + src.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `0x${hex.slice(0, 5)}...${hex.slice(-6)}`;
}

export type SelectedImage = {
    src: string;
    alt: string;
} | null;

interface BrixDetailPopupProps {
    image: SelectedImage;
    onClose: () => void;
}

export function BrixDetailPopup({ image, onClose }: BrixDetailPopupProps) {
    const t = useTranslations('shared.detail');

    // Generate fake coordinates from hash
    const generateCoords = (src: string): { lat: string; lng: string } => {
        let hash = 0;
        for (let i = 0; i < src.length; i++) {
            hash = (hash << 3) - hash + src.charCodeAt(i);
            hash |= 0;
        }
        const lat = (Math.abs(hash % 18000) / 100 - 90).toFixed(4);
        const lng = (Math.abs((hash >> 8) % 36000) / 100 - 180).toFixed(4);
        return {
            lat: `${Math.abs(parseFloat(lat)).toFixed(4)}° ${parseFloat(lat) >= 0 ? t('north') : t('south')}`,
            lng: `${Math.abs(parseFloat(lng)).toFixed(4)}° ${parseFloat(lng) >= 0 ? t('east') : t('west')}`,
        };
    };

    // Prevent background scrolling when popup is open
    usePreventScroll(!!image);

    if (!image) return null;

    const hash = generateHash(image.src);
    const coords = generateCoords(image.src);
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0] + ' UTC';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Popup */}
            <div className="relative w-full max-w-sm bg-background/95 border border-primary/40 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,238,255,0.2)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                    <X className="size-4 text-white" />
                </button>

                {/* Image Section */}
                <div className="p-1">
                    <div className="relative aspect-square w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                            {t('authentic')}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                            <p className="text-[10px] font-mono text-primary truncate">
                                {t('hash')}: {hash}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metadata Section */}
                <div className="p-4 space-y-4">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
                                {image.alt || t('verifiedAsset')}
                            </h3>
                            <span className="text-[10px] text-primary/60 font-mono">
                                {timestamp}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    {/* Coordinates Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                            <p className="text-[9px] text-primary/60 uppercase font-bold">
                                {t('latitude')}
                            </p>
                            <p className="text-xs font-mono text-foreground">{coords.lat}</p>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                            <p className="text-[9px] text-primary/60 uppercase font-bold">
                                {t('longitude')}
                            </p>
                            <p className="text-xs font-mono text-foreground">{coords.lng}</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary/80 transition-all rounded"
                    >
                        {t('fullAnalysis')}
                    </button>
                </div>
            </div>
        </div>
    );
}
