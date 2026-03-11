'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getDefaultAvatar } from '@/utils/cloudinary';
import { cn } from '@/utils/classnames';
import type { AlgoliaUserRecord } from '@/types/algolia.types';

interface AlgoliaUserCardProps {
    hit: AlgoliaUserRecord;
    className?: string;
    onClick?: () => void;
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
export function AlgoliaUserCard({ hit, className, onClick }: AlgoliaUserCardProps) {
    const avatarUrl = hit.avatar?.url || getDefaultAvatar(hit.gender || 'OTHER');

    const fullnameHighlight = hit._highlightResult?.fullname?.value;
    const usernameHighlight = hit._highlightResult?.username?.value;

    return (
        <Link
            href={`/dashboard/artist/${hit.username}`}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border border-border bg-muted',
                'hover:border-primary/40 hover:bg-muted/80 transition-all duration-200',
                className,
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {hit.background?.url && (
                    <div
                        className="absolute inset-0 rounded-full opacity-30 blur-sm"
                        style={{
                            backgroundImage: `url(${hit.background.url})`,
                            backgroundSize: 'cover',
                        }}
                    />
                )}
                <div className="relative size-10 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md">
                    <Image
                        src={avatarUrl}
                        alt={hit.username}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-foreground truncate leading-tight">
                        {fullnameHighlight ? (
                            <Highlight value={fullnameHighlight} />
                        ) : (
                            hit.fullname || hit.username
                        )}
                    </p>
                    {hit._geoloc && <MapPin className="size-3 text-primary/40 shrink-0" />}
                </div>
                <p className="text-xs font-mono text-muted-foreground/60 truncate">
                    @{usernameHighlight ? <Highlight value={usernameHighlight} /> : hit.username}
                </p>
            </div>

            {/* Arrow indicator */}
            <svg
                className="size-4 text-muted-foreground/40 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </Link>
    );
}
