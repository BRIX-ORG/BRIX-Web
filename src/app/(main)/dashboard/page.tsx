'use client';

import { useState } from 'react';
import { BrickDetailModal } from '@/components/artist';
import { DashboardFilters, DashboardMap } from '@/components/dashboard';
import { BrickTagType } from '@/types/brick.types';

type MapTab = 'GLOBAL' | 'ME';
type TagFilter = BrickTagType | 'ALL';

export default function DashboardPage() {
    const [mapTab, setMapTab] = useState<MapTab>('GLOBAL');
    const [selectedTag, setSelectedTag] = useState<TagFilter>('ALL');
    const [selectedBrickId, setSelectedBrickId] = useState<string | undefined>(undefined);

    return (
        <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Dashboard Filters */}
            <DashboardFilters
                mapTab={mapTab}
                selectedTag={selectedTag}
                onMapTabChange={setMapTab}
                onTagChange={setSelectedTag}
            />

            {/* The Map */}
            <DashboardMap
                mapTab={mapTab}
                selectedTag={selectedTag}
                onBrickSelect={setSelectedBrickId}
            />

            {/* Brick Detail Modal */}
            {selectedBrickId && (
                <BrickDetailModal
                    brickId={selectedBrickId}
                    onClose={() => setSelectedBrickId(undefined)}
                />
            )}
        </div>
    );
}
