'use client';

import React from 'react';
import type { ComponentType } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/classnames';

export interface GooeyNavItem {
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string }>;
}

export interface GooeyNavProps {
    items: GooeyNavItem[];
    activeValue: string;
    onChange: (value: string) => void;
    // Keeping these props for backward compatibility if they are passed, but they won't be used
    animationTime?: number;
    particleCount?: number;
    particleDistances?: [number, number];
    particleR?: number;
    timeVariance?: number;
    colors?: string[];
}

const GooeyNav: React.FC<GooeyNavProps> = ({ items, activeValue, onChange }) => {
    return (
        <nav className="flex relative">
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0 relative z-[3] items-center">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeValue === item.value;

                    return (
                        <li key={item.value} className="relative z-10 flex shrink-0">
                            <button
                                onClick={() => onChange(item.value)}
                                className={cn(
                                    'relative z-20 outline-none py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase cursor-pointer bg-transparent border-none w-full h-full whitespace-nowrap transition-colors duration-300',
                                    isActive
                                        ? 'text-black'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {Icon && <Icon className="size-3.5" />}
                                {item.label}
                            </button>

                            {isActive && (
                                <motion.div
                                    layoutId="gooey-nav-active-pill"
                                    className="absolute inset-0 bg-primary rounded-full z-10 shadow-[0_0_15px_rgba(0,238,255,0.4)]"
                                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default GooeyNav;
