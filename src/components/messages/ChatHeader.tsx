'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Info } from 'lucide-react';
import { getAvatarUrl } from '@/utils/cloudinary';
import { timeAgo } from '@/utils/time';
import type { ConversationPartner } from '@/types/message.types';
import { useTypingUsers } from '@/stores/chat-store';

interface ChatHeaderProps {
    partner: ConversationPartner;
    conversationId: string;
    onToggleInfo?: () => void;
    onBack?: () => void;
}

export function ChatHeader({ partner, conversationId, onToggleInfo, onBack }: ChatHeaderProps) {
    const typingUsers = useTypingUsers(conversationId);
    const isTyping = typingUsers.includes(partner.id);

    return (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/40 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-4">
                {/* Back button (mobile) */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                )}

                {/* Avatar */}
                <Link href={`/dashboard/artist/${partner.username}`} className="relative shrink-0">
                    <Image
                        src={getAvatarUrl(partner.avatar, partner.gender)}
                        alt={partner.username}
                        width={40}
                        height={40}
                        className="size-10 rounded-full bg-muted object-cover border border-primary/20"
                    />
                    <div
                        className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background ${
                            partner.isOnline
                                ? 'bg-primary animate-pulse shadow-[0_0_8px_#00eeff]'
                                : 'bg-muted-foreground'
                        }`}
                    />
                </Link>

                <div>
                    <Link
                        href={`/dashboard/artist/${partner.username}`}
                        className="text-sm font-bold leading-none uppercase hover:text-primary transition-colors"
                    >
                        {partner.username}
                    </Link>
                    <div className="mt-1">
                        {isTyping ? (
                            <span className="flex items-center gap-1.5">
                                <span className="flex items-center gap-0.5">
                                    <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                                    <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                                    <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                                </span>
                                <span className="text-[10px] font-mono text-primary tracking-widest uppercase">
                                    typing
                                </span>
                            </span>
                        ) : (
                            <p className="text-[10px] font-mono text-primary/60 tracking-widest uppercase">
                                {partner.isOnline
                                    ? 'Online'
                                    : partner.lastSeenAt
                                      ? `Last seen ${timeAgo(partner.lastSeenAt)}`
                                      : 'Offline'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onToggleInfo}
                    className="size-9 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    title="User info"
                >
                    <Info className="size-4" />
                </button>
            </div>
        </div>
    );
}
