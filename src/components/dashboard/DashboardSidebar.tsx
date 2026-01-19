'use client';

import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Compass,
    Database,
    Network,
    Settings,
    LogOut,
    BarChart3,
    TrendingUp,
    DollarSign,
    Upload,
    ImageIcon,
    Users,
    Shield,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from '@/types/sidebar';
import { BrixBrandLogo } from '@/components/shared';

const sidebarGroups: SidebarGroup[] = [
    {
        title: 'Main',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Feed',
                href: '/dashboard/feed',
                icon: Compass,
            },
            {
                title: 'Archive',
                href: '/dashboard/archive',
                icon: Database,
            },
            {
                title: 'Messages',
                href: '/dashboard/messages',
                icon: MessageCircle,
            },
            {
                title: 'Network',
                href: '/dashboard/network',
                icon: Network,
            },
        ],
    },
    {
        title: 'Analytics',
        items: [
            {
                title: 'Reports',
                href: '/dashboard/reports',
                icon: BarChart3,
                subItems: [
                    {
                        title: 'Verification Stats',
                        href: '/dashboard/reports/verification',
                        icon: Shield,
                    },
                    {
                        title: 'Upload Trends',
                        href: '/dashboard/reports/uploads',
                        icon: TrendingUp,
                    },
                    { title: 'Revenue', href: '/dashboard/reports/revenue', icon: DollarSign },
                ],
            },
            {
                title: 'Uploads',
                href: '/dashboard/uploads',
                icon: Upload,
            },
            {
                title: 'Assets',
                href: '/dashboard/assets',
                icon: ImageIcon,
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                title: 'Users',
                href: '/dashboard/users',
                icon: Users,
            },
        ],
    },
];

const bottomItems = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export function DashboardSidebar({
    isOpen,
    onClose,
    isCollapsed = false,
    toggleCollapse,
}: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300 lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'w-20' : 'w-64',
                )}
            >
                {/* Collapse Toggle Button - BKB Style */}
                <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex z-10 absolute top-12 right-0 translate-x-1/2 size-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30 hover:bg-primary/40 transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="size-4 text-primary" />
                    ) : (
                        <ChevronLeft className="size-4 text-primary" />
                    )}
                </button>

                <div className={cn('flex h-full flex-col py-4', isCollapsed ? 'px-2' : 'px-3')}>
                    {/* Logo & Close Button */}
                    <div
                        className={cn(
                            'mb-4 flex items-center',
                            isCollapsed ? 'justify-center' : 'justify-between px-3',
                        )}
                    >
                        {isCollapsed ? (
                            <div className="flex items-center justify-center shrink-0">
                                {/* Stable wrapper */}
                                <div className="size-8 flex items-center justify-center">
                                    {/* Rotated icon */}
                                    <div className="size-8 bg-primary flex items-center justify-center rounded-sm rotate-45 origin-center">
                                        <div className="size-4 bg-background -rotate-45 origin-center" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <BrixBrandLogo href="/dashboard" size="sm" animated />
                        )}

                        {/* Mobile Close Button */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Navigation Groups */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {sidebarGroups.map((group) => (
                            <div key={group.title} className="mb-4">
                                {!isCollapsed && (
                                    <h3 className="mb-2 px-3 text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">
                                        {group.title}
                                    </h3>
                                )}
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <SidebarItem
                                            key={item.href}
                                            item={item}
                                            pathname={pathname}
                                            isCollapsed={isCollapsed}
                                            onClose={onClose}
                                        />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-border pt-4">
                        {/* Network Status (only when expanded) */}
                        {!isCollapsed && (
                            <div className="mb-4 p-3 border border-border bg-muted/50 rounded-lg">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-bold">
                                    Network Status
                                </p>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-mono text-primary">
                                        NODES_ACTIVE
                                    </span>
                                    <span className="text-xs font-mono">1,402</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-primary">
                                        BLOCKS_VER
                                    </span>
                                    <span className="text-xs font-mono">2.4M</span>
                                </div>
                            </div>
                        )}

                        {/* Bottom Items */}
                        <ul className="space-y-1 mb-2">
                            {bottomItems.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    item={item}
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    onClose={onClose}
                                />
                            ))}
                        </ul>

                        {/* Logout Button */}
                        <button
                            className={cn(
                                'flex w-full items-center rounded-lg p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
                                isCollapsed ? 'justify-center' : '',
                            )}
                            title={isCollapsed ? 'Logout' : undefined}
                        >
                            <LogOut className="size-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="ml-3 text-sm font-medium">Logout</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
