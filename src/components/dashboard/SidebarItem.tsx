'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/types/utils';
import { SidebarItemType } from '@/types/sidebar';

interface SidebarItemProps {
    item: SidebarItemType;
    pathname: string;
    isCollapsed?: boolean;
    onClose?: () => void;
}

export function SidebarItem({ item, pathname, isCollapsed = false, onClose }: SidebarItemProps) {
    const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));
    const [isExpanded, setIsExpanded] = useState(isActive);

    const handleClick = (e: React.MouseEvent) => {
        if (item.subItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        } else {
            onClose?.();
        }
    };

    // Collapsed State - BKB Style
    if (isCollapsed) {
        return (
            <li className="group relative list-none">
                <div className="flex flex-col items-center">
                    <Link
                        href={item.href}
                        onClick={handleClick}
                        className={cn(
                            'flex items-center justify-center rounded-lg p-3 transition-all duration-200 w-full relative',
                            isActive && !item.subItems
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            item.subItems && isExpanded && 'bg-muted shadow-inner',
                        )}
                        title={!isExpanded ? item.title : undefined}
                    >
                        <item.icon
                            className={cn(
                                'size-5 shrink-0 transition duration-300',
                                isActive && !item.subItems ? 'text-primary' : '',
                                item.subItems && isExpanded && 'rotate-12 scale-110 text-primary',
                            )}
                        />
                        {/* Chevron indicator for items with subitems */}
                        {item.subItems && (
                            <div
                                className={cn(
                                    'absolute right-0 bottom-1 size-4 bg-primary rounded-full border-2 border-background flex items-center justify-center transition-transform duration-300',
                                    isExpanded ? 'scale-0' : 'scale-100',
                                )}
                            >
                                <ChevronDown className="size-2 text-primary-foreground" />
                            </div>
                        )}
                    </Link>

                    {/* Vertical Sub-icons for Collapsed State */}
                    {item.subItems && isExpanded && (
                        <ul className="mt-1 flex flex-col items-center gap-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                            {item.subItems.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                    <li key={subItem.href} className="w-full flex justify-center">
                                        <Link
                                            href={subItem.href}
                                            onClick={() => onClose?.()}
                                            className={cn(
                                                'flex items-center justify-center rounded-lg p-1.5 transition-all size-8',
                                                isSubActive
                                                    ? 'bg-primary text-primary-foreground shadow-md'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                                            )}
                                            title={subItem.title}
                                        >
                                            {subItem.icon ? (
                                                <subItem.icon
                                                    className="size-3.5"
                                                    strokeWidth={2.5}
                                                />
                                            ) : (
                                                <div className="size-1.5 rounded-full bg-current" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Hover Tooltip for Collapsed State (Only when not expanded) */}
                {!isExpanded && (
                    <div className="absolute left-full top-0 ml-2 hidden w-max min-w-[120px] max-w-[200px] rounded-lg border border-border bg-background p-2 shadow-lg group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div
                            className={cn(
                                'px-2 py-1 text-sm font-semibold text-foreground',
                                item.subItems && 'mb-2 border-b border-border',
                            )}
                        >
                            {item.title}
                        </div>
                        {item.subItems && (
                            <ul className="space-y-1">
                                {item.subItems.map((subItem) => {
                                    const isSubActive = pathname === subItem.href;
                                    return (
                                        <li key={subItem.href}>
                                            <Link
                                                href={subItem.href}
                                                onClick={() => onClose?.()}
                                                className={cn(
                                                    'flex items-center rounded-lg p-2 text-sm transition-all',
                                                    isSubActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                {subItem.icon && (
                                                    <subItem.icon
                                                        className={cn(
                                                            'size-4 mr-2 shrink-0',
                                                            isSubActive ? 'text-primary' : '',
                                                        )}
                                                    />
                                                )}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </li>
        );
    }

    // Expanded State
    return (
        <li>
            <Link
                href={item.href}
                onClick={handleClick}
                className={cn(
                    'flex items-center justify-between rounded-lg p-3 text-sm transition-all duration-200 group',
                    isActive && !item.subItems
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
            >
                <div className="flex items-center overflow-hidden">
                    <item.icon
                        className={cn(
                            'size-5 shrink-0 transition duration-75',
                            isActive && !item.subItems ? 'text-primary' : '',
                        )}
                    />
                    <span className="ml-3 font-medium uppercase tracking-tight text-sm">
                        {item.title}
                    </span>
                </div>
                {item.subItems && (
                    <div className={cn('transition-colors', isExpanded ? 'text-primary' : '')}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                )}
            </Link>

            {/* Sub Items */}
            {item.subItems && isExpanded && (
                <ul className="mt-1 space-y-1 pl-6 border-l border-border ml-5">
                    {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                            <li key={subItem.href}>
                                <Link
                                    href={subItem.href}
                                    onClick={() => onClose?.()}
                                    className={cn(
                                        'flex items-center rounded-lg p-2 text-sm transition-all',
                                        isSubActive
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {subItem.icon && (
                                        <subItem.icon
                                            className={cn(
                                                'size-4 mr-2 shrink-0',
                                                isSubActive ? 'text-primary' : '',
                                            )}
                                        />
                                    )}
                                    <span>{subItem.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}
