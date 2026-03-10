'use client';

import { Bell, CheckCheck, Inbox, Loader2 } from 'lucide-react';
import { NotificationItem } from '@/components/notifications';
import { useNotificationStore } from '@/stores/notification-store';
import {
    useInfiniteNotifications,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
    useMarkNotificationAsRead,
} from '@/hooks/apis/notification.api';
import { useEffect, useState } from 'react';
import { ConfirmPopup, Portal } from '@/components/shared';
import { cn } from '@/utils/classnames';

export default function NotificationsPage() {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const { notifications, order, unreadCount, markAllAsRead, mergeNotifications } =
        useNotificationStore();

    // Fetch notifications infinitely
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteNotifications({ limit: 20 });
    const markAllReadMutation = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();
    const markReadMutation = useMarkNotificationAsRead();

    // Sync newly fetched pages to store
    useEffect(() => {
        if (data?.pages) {
            const allFetched = data.pages.flatMap((page) => page.data);
            if (allFetched.length > 0) {
                mergeNotifications(allFetched);
            }
        }
    }, [data, mergeNotifications]);

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
        markAllAsRead();
    };

    return (
        <div className="flex-1 flex flex-col min-h-full bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(0,238,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-20 px-4 md:px-8 py-8 bg-background/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-brix-primary uppercase tracking-[0.4em] animate-pulse">
                            <span className="size-1.5 rounded-full bg-brix-primary shadow-[0_0_8px_rgba(0,238,255,0.8)]" />
                            Live_Feed_Active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase flex items-center gap-4">
                            Notifications
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground font-mono text-[10px] uppercase tracking-widest pt-1">
                            <span>[UNIT_ID]: DASH_NOTI_01</span>
                            <span className="size-1 rounded-full bg-white/10" />
                            {unreadCount > 0 ? (
                                <span className="text-brix-primary font-bold">
                                    {unreadCount} UNREAD_SIGNALS
                                </span>
                            ) : (
                                'STATUS_CLEAR'
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={markAllReadMutation.isPending}
                                className="group flex items-center gap-2 px-6 py-2.5 bg-brix-primary text-black hover:bg-white transition-all rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(0,238,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            >
                                {markAllReadMutation.isPending ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    <CheckCheck className="size-3" />
                                )}
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className="flex-1 relative z-10 max-w-4xl mx-auto w-full px-4 md:px-8 py-10">
                {/* Visual Connector Line */}
                <div className="absolute left-[34px] md:left-[50px] top-0 bottom-0 w-px bg-linear-to-b from-brix-primary/20 via-brix-primary/5 to-transparent hidden md:block" />

                {isLoading && order.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6 text-center">
                        <div className="relative">
                            <div className="size-16 border-2 border-brix-primary/10 border-t-brix-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Bell className="size-6 text-brix-primary/40" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.4em] text-brix-primary font-black animate-pulse">
                                Syncing_Neural_Network
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">
                                Establishing encrypted handshakes...
                            </p>
                        </div>
                    </div>
                ) : order.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center max-w-sm mx-auto group">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-brix-primary/10 blur-3xl rounded-full scale-150 group-hover:bg-brix-primary/20 transition-all duration-1000" />
                            <Inbox className="size-20 text-muted-foreground/30 relative z-10 group-hover:text-brix-primary/40 transition-colors" />
                            <div className="absolute -top-2 -right-2 size-6 bg-background border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-20">
                                <span className="size-2 bg-muted-foreground/40 rounded-full group-hover:bg-brix-primary/60 transition-colors" />
                            </div>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-[0.2em] text-foreground">
                            Signals Terminated
                        </h3>
                        <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-mono uppercase tracking-tighter opacity-70">
                            Your verification node is currently idle. Notifications about your
                            bricks and network activity will appear here once detected.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {order.map((id) => (
                            <div key={id} className="relative group/item">
                                <NotificationItem
                                    notification={notifications[id]}
                                    onDelete={(nid) => setDeleteConfirmId(nid)}
                                    onClick={(n) => {
                                        if (!n.isRead) {
                                            markReadMutation.mutate(n.id);
                                            useNotificationStore.getState().markAsRead(n.id);
                                        }
                                    }}
                                />
                            </div>
                        ))}

                        {hasNextPage && (
                            <div className="flex justify-center pt-8">
                                <button
                                    type="button"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className={cn(
                                        'group relative px-8 py-3 border text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer',
                                        'border-brix-primary/30 text-brix-primary/70 hover:border-brix-primary hover:text-brix-primary hover:shadow-[0_0_20px_rgba(0,238,255,0.2)]',
                                        'disabled:opacity-50 disabled:cursor-not-allowed text-center z-10 bg-background/50 backdrop-blur-md rounded-sm',
                                    )}
                                >
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Syncing...
                                        </span>
                                    ) : (
                                        'Load More Signals'
                                    )}
                                </button>
                            </div>
                        )}

                        {!hasNextPage && order.length > 0 && (
                            <div className="py-16 flex flex-col items-center gap-4 text-center">
                                <div className="h-px w-20 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.4em] font-black">
                                    End of Stream — Signal Stable
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <Portal>
                <ConfirmPopup
                    isOpen={!!deleteConfirmId}
                    onClose={() => setDeleteConfirmId(null)}
                    onConfirm={() => {
                        if (deleteConfirmId) {
                            deleteMutation.mutate(deleteConfirmId);
                            useNotificationStore.getState().removeNotification(deleteConfirmId);
                            setDeleteConfirmId(null);
                        }
                    }}
                    title="Delete Notification"
                    message="Are you sure you want to delete this notification? This action cannot be undone."
                    confirmText="Delete"
                    type="danger"
                    isLoading={deleteMutation.isPending}
                />
            </Portal>
        </div>
    );
}
