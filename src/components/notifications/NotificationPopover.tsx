'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { NotificationItem } from '@/components/notifications';
import { ConfirmPopup, Portal } from '@/components/shared';
import { useNotificationStore } from '@/stores/notification-store';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from '@/hooks/apis/notification.api';

export function NotificationPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { notifications, order, unreadCount, setNotifications, markAllAsRead } =
        useNotificationStore();

    // Fetch initial notifications
    const { data: initialData, isLoading } = useNotifications({ limit: 10 });
    const { data: initialUnreadCount } = useUnreadNotificationCount();
    const markReadMutation = useMarkNotificationAsRead();
    const markAllReadMutation = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();

    // Sync initial data to store
    useEffect(() => {
        if (initialData?.data) {
            setNotifications(initialData.data);
        }
    }, [initialData, setNotifications]);

    useEffect(() => {
        if (typeof initialUnreadCount === 'number') {
            useNotificationStore.getState().setUnreadCount(initialUnreadCount);
        }
    }, [initialUnreadCount]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
        markAllAsRead();
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={[
                    'relative size-9 flex items-center justify-center rounded border border-border bg-muted hover:bg-muted/80 transition-all duration-200',
                    isOpen
                        ? 'border-brix-primary/40 bg-brix-primary/5 text-brix-primary glow-cyan'
                        : '',
                ].join(' ')}
            >
                <Bell
                    className={['size-4 transition-transform', isOpen ? 'scale-110' : ''].join(' ')}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center rounded-full bg-brix-primary text-[8px] font-black text-black glow-cyan animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover Content */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-background/95 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] uppercase font-bold text-brix-primary hover:text-white transition-colors flex items-center gap-1"
                            >
                                <CheckCheck className="size-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {isLoading ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-3">
                                <div className="size-8 border-2 border-brix-primary/20 border-t-brix-primary rounded-full animate-spin" />
                                <span className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
                                    Syncing...
                                </span>
                            </div>
                        ) : order.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                                <Inbox className="size-10 mb-4 text-muted-foreground" />
                                <p className="text-sm font-medium uppercase tracking-tight">
                                    Everything is quiet
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {order.slice(0, 10).map((id) => (
                                    <NotificationItem
                                        key={id}
                                        notification={notifications[id]}
                                        onDelete={(nid) => {
                                            setDeleteConfirmId(nid);
                                        }}
                                        onClick={(n) => {
                                            if (!n.isRead) {
                                                markReadMutation.mutate(n.id);
                                                useNotificationStore.getState().markAsRead(n.id);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/dashboard/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center border-t border-white/10 bg-white/5 hover:bg-brix-primary/10 transition-colors"
                    >
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-brix-primary flex items-center justify-center gap-2">
                            See all activity →
                        </span>
                    </Link>
                </div>
            )}

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
