'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/classnames';
import { getDefaultAvatar } from '@/utils/cloudinary';
import { timeAgo } from '@/utils/time';
import { formatCoord } from '@/utils/brick';
import type { AlgoliaBrickRecord } from '@/types/algolia.types';

interface AlgoliaBrickCardProps {
    hit: AlgoliaBrickRecord;
    onClick?: (hit: AlgoliaBrickRecord) => void;
    className?: string;
}

/** Render an Algolia highlight string (contains <em> tags) safely */
function Highlight({ value, className }: { value: string | undefined; className?: string }) {
    if (!value) return null;
    return (
        <span
            className={cn('[&_em]:text-primary [&_em]:not-italic [&_em]:font-bold', className)}
            dangerouslySetInnerHTML={{ __html: value }}
        />
    );
}

export function AlgoliaBrickCard({ hit, onClick, className }: AlgoliaBrickCardProps) {
    const t = useTranslations('search');
    const imageUrl = hit.watermark?.url || hit.thumbnails?.url || hit.media?.url;
    const hasImage = !!imageUrl;
    const hasContent = hasImage || hit.title || hit.description;
    const avatarUrl = hit.avatar?.url || getDefaultAvatar(hit.gender || 'OTHER');

    const titleHighlight = hit._highlightResult?.title?.value;
    const descHighlight = hit._highlightResult?.description?.value;

    return (
        <div
            className={cn(
                'bg-muted border border-border flex flex-col overflow-hidden',
                'cursor-pointer group hover:-translate-y-1 transition-transform duration-300 rounded-xl',
                className,
            )}
            onClick={() => onClick?.(hit)}
        >
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between bg-background/50">
                <h2 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-secondary animate-pulse rounded-full" />
                    {hit.tagType} {t('card.brick')}
                </h2>
                <span className="text-[9px] font-mono text-primary/50 uppercase tracking-widest hidden sm:inline-block">
                    {t('card.id')}: {hit.objectID.slice(0, 8)}
                </span>
            </div>

            {/* Preview Area */}
            <div className="flex-1 p-3 flex items-start justify-center">
                <div
                    className={cn(
                        'w-full max-w-sm bg-background/95 border rounded-lg overflow-hidden transition-all duration-500',
                        hasContent
                            ? 'border-primary/40 shadow-[0_0_30px_rgba(0,238,255,0.15)] group-hover:shadow-[0_0_50px_rgba(0,238,255,0.25)]'
                            : 'border-border/30 border-dashed opacity-60',
                    )}
                >
                    {/* Image Section */}
                    <div className="p-1">
                        <div className="relative aspect-4/3 w-full bg-primary/10 rounded-sm overflow-hidden border border-primary/20">
                            {hasImage ? (
                                <>
                                    <Image
                                        src={imageUrl!}
                                        alt={hit.title || 'Preview'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                        unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm">
                                        {hit.tagType}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <div className="size-12 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center rounded">
                                        <ImageIcon className="size-6 text-muted-foreground/20" />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                                        {t('card.noImage')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-3 space-y-3">
                        {/* Title & Timestamp */}
                        <div>
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase truncate flex-1 leading-tight">
                                    {titleHighlight ? (
                                        <Highlight value={titleHighlight} />
                                    ) : (
                                        hit.title || (
                                            <span className="text-muted-foreground/30 italic font-normal normal-case">
                                                {t('card.untitled')}
                                            </span>
                                        )
                                    )}
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-primary/60 font-mono shrink-0">
                                    {timeAgo(new Date(hit.createdAt).toISOString())}
                                </span>
                            </div>
                            {(descHighlight || hit.description) && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {descHighlight ? (
                                        <Highlight value={descHighlight} />
                                    ) : (
                                        hit.description
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Coordinates */}
                        {hit._geoloc && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                    <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                                        {t('card.latitude')}
                                    </p>
                                    <p className="text-[10px] font-mono text-foreground truncate">
                                        {formatCoord(hit._geoloc.lat, 'N', 'S')}
                                    </p>
                                </div>
                                <div className="bg-primary/5 border border-primary/20 p-2 rounded">
                                    <p className="text-[8px] text-primary/60 uppercase font-bold mb-0.5">
                                        {t('card.longitude')}
                                    </p>
                                    <p className="text-[10px] font-mono text-foreground truncate">
                                        {formatCoord(hit._geoloc.lng, 'E', 'W')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* User */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <Image
                                src={avatarUrl}
                                alt={hit.username}
                                width={20}
                                height={20}
                                className="size-5 rounded-full object-cover border border-primary/20 bg-muted"
                                unoptimized
                            />
                            <span className="text-[10px] sm:text-xs text-muted-foreground/70 font-mono truncate">
                                @{hit.username}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
