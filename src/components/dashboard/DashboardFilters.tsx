'use client';

import { Map as MapIcon, User } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { BrickTagType } from '@/types/brick.types';

type MapTab = 'GLOBAL' | 'ME';
type TagFilter = BrickTagType | 'ALL';

const TAG_FILTERS: (BrickTagType | 'ALL')[] = ['ALL', 'REALTIME', 'ART', 'PRODUCT'];

interface DashboardFiltersProps {
    mapTab: MapTab;
    selectedTag: TagFilter;
    onMapTabChange: (tab: MapTab) => void;
    onTagChange: (tag: TagFilter) => void;
}

export function DashboardFilters({
    mapTab,
    selectedTag,
    onMapTabChange,
    onTagChange,
}: DashboardFiltersProps) {
    return (
        <>
            {/* Map Tab Filter - top */}
            <div className="absolute top-4 left-4 z-10 sm:pointer-events-none">
                <div className="flex bg-background/80 backdrop-blur-md rounded-md p-1 border border-border shadow-lg sm:pointer-events-auto">
                    <button
                        onClick={() => onMapTabChange('GLOBAL')}
                        className={cn(
                            'px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2',
                            mapTab === 'GLOBAL'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <MapIcon className="size-4" />
                        Global Map
                    </button>
                    <button
                        onClick={() => onMapTabChange('ME')}
                        className={cn(
                            'px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2',
                            mapTab === 'ME'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <User className="size-4" />
                        My Footprints
                    </button>
                </div>
            </div>

            {/* Tag Filter - bottom on mobile, right on desktop */}
            <div className="absolute bottom-4 left-4 z-10 sm:absolute sm:top-4 sm:left-auto sm:right-4 sm:bottom-auto sm:pointer-events-none pointer-events-none">
                <div className="flex bg-background/80 backdrop-blur-md rounded-md p-1 border border-border shadow-lg pointer-events-auto sm:pointer-events-auto">
                    {TAG_FILTERS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onTagChange(tag)}
                            className={cn(
                                'px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors',
                                selectedTag === tag
                                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
