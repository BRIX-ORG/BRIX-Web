import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink, Heart, MessageSquare, UserPlus } from 'lucide-react';
import type { NotificationGroup, NotificationType } from '@/types/notification.types';
import { timeAgo } from '@/utils/time';
import { getAvatarUrl } from '@/utils/cloudinary';

interface NotificationItemProps {
    notification: NotificationGroup;
    onDelete?: (id: string) => void;
    onClick?: (notification: NotificationGroup) => void;
}

export function NotificationItem({ notification, onDelete, onClick }: NotificationItemProps) {
    const t = useTranslations('notifications');
    const tc = useTranslations('common');
    const router = useRouter();

    const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; text: string }> = useMemo(
        () => ({
            UPVOTE_BRICK: {
                icon: <Heart className="size-3 text-red-500 fill-red-500" />,
                text: t('types.UPVOTE_BRICK'),
            },
            UPVOTE_COMMENT: {
                icon: <Heart className="size-3 text-red-500 fill-red-500" />,
                text: t('types.UPVOTE_COMMENT'),
            },
            COMMENT_BRICK: {
                icon: <MessageSquare className="size-3 text-brix-primary fill-brix-primary" />,
                text: t('types.COMMENT_BRICK'),
            },
            REPLY_COMMENT: {
                icon: <MessageSquare className="size-3 text-brix-primary fill-brix-primary" />,
                text: t('types.REPLY_COMMENT'),
            },
            FOLLOW: {
                icon: <UserPlus className="size-3 text-brix-secondary" />,
                text: t('types.FOLLOW'),
            },
        }),
        [t],
    );

    const avatarUrl = useMemo(
        () => getAvatarUrl(notification.lastActor.avatar ?? null, notification.lastActor.gender),
        [notification.lastActor.avatar, notification.lastActor.gender],
    );

    const config = TYPE_CONFIG[notification.type] ?? {
        icon: <ExternalLink className="size-3 text-muted-foreground" />,
        text: t('types.default'),
    };

    const handleItemClick = () => {
        // First, trigger the potential mark-as-read click
        onClick?.(notification);

        // Then navigate based on type
        if (notification.type === 'FOLLOW') {
            router.push(`/dashboard/artist/${notification.lastActor.username}`);
        } else if (notification.brick) {
            router.push(`/dashboard/brick/${notification.brick.id}`);
        }
    };

    return (
        <div
            onClick={handleItemClick}
            className={[
                'group relative flex items-start gap-3 p-3 transition-all duration-200 cursor-pointer border-b border-white/5',
                notification.isRead ? 'opacity-70' : 'bg-white/2 border-l-2 border-l-brix-primary',
                'hover:bg-white/5 hover:opacity-100',
            ].join(' ')}
        >
            {/* Actor Avatar */}
            <Link
                href={`/dashboard/artist/${notification.lastActor.username}`}
                onClick={(e) => e.stopPropagation()}
                className="relative shrink-0 pt-0.5 z-10"
            >
                <div className="size-10 rounded-full overflow-hidden border border-white/10 group-hover:border-brix-primary/40 transition-colors">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={notification.lastActor.username}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
                            {notification.lastActor.username[0]}
                        </div>
                    )}
                </div>
                {/* Type Icon Badge */}
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-lg">
                    {config.icon}
                </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-sm leading-snug">
                    <Link
                        href={`/dashboard/artist/${notification.lastActor.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-foreground hover:text-brix-primary transition-colors z-10 relative"
                    >
                        {notification.lastActor.fullName || notification.lastActor.username}
                    </Link>
                    {notification.actorsCount > 1 && (
                        <span className="text-muted-foreground text-xs ml-1">
                            {t('types.others', { count: notification.actorsCount - 1 })}
                        </span>
                    )}
                    <span className="text-muted-foreground ml-1">{config.text}</span>
                    {notification.brick && (
                        <span className="font-medium text-brix-primary ml-1 truncate italic">
                            &ldquo;{notification.brick.title}&rdquo;
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-mono">
                        {timeAgo(notification.updatedAt)}
                    </span>
                    {!notification.isRead && (
                        <span className="size-1.5 rounded-full bg-brix-primary shadow-[0_0_6px_rgba(0,238,255,0.6)]" />
                    )}
                </div>
            </div>

            {/* Brick Thumbnail (Context) */}
            {notification.brick?.watermark?.url && (
                <div className="shrink-0 size-12 rounded-sm border border-white/10 overflow-hidden bg-primary/5 group-hover:border-brix-primary/40 transition-colors ml-2 self-center">
                    <Image
                        src={notification.brick.watermark.url}
                        alt={notification.brick.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Actions (Delete only, at the very end) */}
            <div className="flex flex-col justify-center shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(notification.id);
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-destructive hover:text-white transition-all transform hover:scale-110"
                    title={tc('delete')}
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-transparent to-brix-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
