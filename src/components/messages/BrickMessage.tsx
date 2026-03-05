'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import type { Message } from '@/types/message.types';
import type { ConversationPartner } from '@/types/message.types';
import { getAvatarUrl } from '@/utils/cloudinary';
import { cn } from '@/utils/classnames';

interface BrickMessageProps {
    message: Message;
    isMe: boolean;
    partner: ConversationPartner;
}

/**
 * Renders a message that contains a brickId reference.
 * Displays a styled card linking to the brick detail page.
 */
export function BrickMessage({ message, isMe, partner }: BrickMessageProps) {
    if (!message.brickId) return null;

    return (
        <div className={cn('flex items-end gap-3 max-w-[85%]', isMe && 'ml-auto justify-end')}>
            {/* Partner avatar */}
            {!isMe && (
                <Link href={`/dashboard/artist/${partner.username}`} className="shrink-0">
                    <Image
                        src={getAvatarUrl(partner.avatar, partner.gender)}
                        alt={partner.username}
                        width={32}
                        height={32}
                        className="size-8 rounded-full bg-muted shrink-0 object-cover border border-primary/20"
                    />
                </Link>
            )}

            <div className="flex flex-col gap-1">
                {/* Sender label */}
                {!isMe && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">
                        {partner.username} · BRICK_SHARE
                    </p>
                )}

                {/* Brick card */}
                <Link
                    href={`/dashboard/brick/${message.brickId}`}
                    className="group relative overflow-hidden bg-muted border border-border p-3 rounded-sm max-w-md block hover:border-primary/40 transition-colors"
                >
                    {/* First image if available */}
                    {message.images && message.images.length > 0 && (
                        <Image
                            src={message.images[0].url}
                            alt="Brick image"
                            width={message.images[0].width || 400}
                            height={message.images[0].height || 225}
                            className="w-full aspect-video object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-500 mb-3"
                        />
                    )}

                    {/* Brick reference */}
                    <div className="flex items-center gap-2 p-2 bg-black/60 font-mono text-[9px] border border-border/50">
                        <MapPin className="size-3 text-primary/60 shrink-0" />
                        <span className="text-primary/60">BRICK_REF</span>
                        <span className="text-foreground font-bold truncate flex-1">
                            {message.brickId}
                        </span>
                        <ExternalLink className="size-3 text-primary/40 shrink-0" />
                    </div>

                    {/* Neon Corners */}
                    <div className="absolute top-2 left-2 size-4 border-l-2 border-t-2 border-primary" />
                    <div className="absolute bottom-2 right-2 size-4 border-r-2 border-b-2 border-primary" />
                </Link>

                {/* Caption */}
                {message.content && (
                    <div className="bg-muted/80 border border-border p-3 rounded-sm text-sm">
                        {message.content}
                    </div>
                )}
            </div>
        </div>
    );
}
