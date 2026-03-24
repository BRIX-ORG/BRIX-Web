'use client';

import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { useTranslations } from 'next-intl';
import type { UserBrick } from '@/types/brick.types';
import { formatCoord, formatTimestamp, generateHash } from '@/utils/brick';

interface ArtBrickCardProps {
    brick: UserBrick;
    className?: string;
    onClick?: (brick: UserBrick) => void;
}

export function ArtBrickCard({ brick, className, onClick }: ArtBrickCardProps) {
    const t = useTranslations('artist.card');
    const imageUrl = brick.watermark?.url || brick.media?.url;
    const hash = generateHash(brick.title);
    const timestamp = formatTimestamp(brick.createdAt);

    return (
        <div
            className={cn(
                'bg-background/95 border border-primary/40 rounded-lg overflow-hidden',
                'shadow-[0_0_30px_rgba(0,238,255,0.15)] cursor-pointer group',
                'transition-transform duration-300 hover:scale-[0.98]',
                'break-inside-avoid mb-4',
                className,
            )}
            onClick={() => onClick?.(brick)}
        >
            {/* Image Section */}
            <div className="p-1 shrink-0">
                <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={brick.generatedDescription || brick.description || brick.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 20vw"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground/40 text-xs font-mono">
                                {t('noImage')}
                            </span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                        {brick.tagType}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
                        <p className="text-[10px] font-mono text-primary truncate">
                            {t('hash')}: {hash}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metadata Section */}
            <div className="p-3 space-y-2">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xs font-bold tracking-tight text-foreground uppercase truncate flex-1">
                            {brick.title}
                        </h3>
                        <span className="text-[9px] text-primary/60 font-mono ml-2 shrink-0">
                            {timestamp}
                        </span>
                    </div>
                    {brick.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {brick.description}
                        </p>
                    )}
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-2 gap-1">
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold">
                            {t('latitude')}
                        </p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.latitude, 'N', 'S')}
                        </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold">
                            {t('longitude')}
                        </p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {formatCoord(brick.longitude, 'E', 'W')}
                        </p>
                    </div>
                </div>

                {/* Address */}
                {brick.address && brick.address !== 'string' && (
                    <div className="bg-primary/5 border border-primary/20 p-1.5 rounded">
                        <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                            {t('location')}
                        </p>
                        <p className="text-[9px] font-mono text-foreground truncate">
                            {brick.address}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
