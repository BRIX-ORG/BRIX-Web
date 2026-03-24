'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { useTranslations } from 'next-intl';

interface RealtimeBrickPreviewCardProps {
    imageUrl?: string | null;
    title?: string;
    description?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    nonce?: string | null;
    username?: string;
    avatarUrl?: string;
    className?: string;
}

function formatCoord(value: number | null | undefined, pos: string, neg: string): string {
    if (value == null) return '—';
    const abs = Math.abs(value).toFixed(4);
    return `${abs}° ${value >= 0 ? pos : neg}`;
}

export function RealtimeBrickPreviewCard({
    imageUrl,
    title,
    description,
    address,
    latitude,
    longitude,
    nonce,
    username,
    avatarUrl,
    className,
}: RealtimeBrickPreviewCardProps) {
    const t = useTranslations('camera.RealtimeBrickPreviewCard');
    const hasImage = !!imageUrl;
    const hasContent = hasImage || title || description;

    const timestamp = useMemo(() => {
        return new Date().toISOString().split('T')[1].split('.')[0] + ' UTC';
    }, []);

    const fakeHash = useMemo(() => {
        if (!title) return '0x00000...000000';
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = (hash << 5) - hash + title.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
        return `0x${hex.slice(0, 5)}...${hex.slice(-6)}`;
    }, [title]);

    return (
        <div
            className={cn('bg-muted border border-border flex flex-col overflow-hidden', className)}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-secondary animate-pulse" />
                    {t('header')}
                </h2>
                <span className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">
                    {t('badge')}
                </span>
            </div>

            {/* Card Preview Area */}
            <div className="flex-1 p-4 flex items-start justify-center">
                <div
                    className={cn(
                        'w-full max-w-sm bg-background/95 border rounded-lg overflow-hidden backdrop-blur-xl transition-all duration-500',
                        hasContent
                            ? 'border-primary/40 shadow-[0_0_50px_rgba(0,238,255,0.2)]'
                            : 'border-border/30 border-dashed opacity-60',
                    )}
                >
                    {/* Image Section */}
                    <div className="p-1">
                        <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                            {hasImage ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={title || 'Preview'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                        {t('realtime')}
                                    </div>
                                    {nonce && (
                                        <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold font-mono rounded-full">
                                            {nonce}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                                        <p className="text-[10px] font-mono text-primary truncate">
                                            {t('hash')}: {fakeHash}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="size-16 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                        <ImageIcon className="size-8 text-muted-foreground/20" />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                                        {t('noCapture')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-4 space-y-4">
                        {/* Title & Timestamp */}
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase truncate flex-1 mr-2">
                                    {title || (
                                        <span className="text-muted-foreground/30 italic font-normal normal-case">
                                            {t('untitled')}
                                        </span>
                                    )}
                                </h3>
                                <span className="text-[10px] text-primary/60 font-mono shrink-0">
                                    {timestamp}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {description || (
                                    <span className="italic text-muted-foreground/30">
                                        {t('noDescription')}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Coordinates Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold">
                                    {t('lat')}
                                </p>
                                <p className="text-xs font-mono text-foreground">
                                    {formatCoord(latitude, 'N', 'S')}
                                </p>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold">
                                    {t('lng')}
                                </p>
                                <p className="text-xs font-mono text-foreground">
                                    {formatCoord(longitude, 'E', 'W')}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        {address && (
                            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                <p className="text-[9px] text-primary/60 uppercase font-bold mb-0.5">
                                    {t('location')}
                                </p>
                                <p className="text-xs font-mono text-foreground truncate">
                                    {address}
                                </p>
                            </div>
                        )}

                        {/* Artist Info */}
                        <div className="flex items-center gap-2.5 pt-1 border-t border-primary/10">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={username || 'User'}
                                    width={28}
                                    height={28}
                                    className="size-7 rounded-full object-cover border border-primary/30"
                                />
                            ) : (
                                <div className="size-7 rounded-full bg-primary/10 border border-primary/20" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold tracking-tight text-foreground truncate">
                                    {username || (
                                        <span className="text-muted-foreground/30">username</span>
                                    )}
                                </p>
                                <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest">
                                    {t('artist')}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="w-full py-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest text-center rounded border border-primary/20">
                            {t('cta')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/40 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {t('statusLabel')}
                    </span>
                    <span
                        className={cn(
                            'text-[10px] font-bold',
                            hasContent ? 'text-primary' : 'text-muted-foreground/40',
                        )}
                    >
                        {hasContent ? t('rendering') : t('awaitingData')}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {t('tagType')}
                    </span>
                    <span className="text-[10px] font-bold text-secondary">{t('tagValue')}</span>
                </div>
            </div>
        </div>
    );
}
