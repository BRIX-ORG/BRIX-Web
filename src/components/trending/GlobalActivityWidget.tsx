'use client';

import { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@/components/ui';
import { useGetNewsfeedLocations } from '@/hooks/apis/brick.api';

export function GlobalActivityWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: globalLocations = [] } = useGetNewsfeedLocations({ isPublic: true });

    // Collapsed state - circular globe button
    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-8 right-8 z-40 hidden xl:flex size-14 bg-primary/20 border border-primary/40 rounded-full items-center justify-center shadow-[0_0_30px_rgba(0,238,255,0.3)] hover:bg-primary/30 hover:scale-110 transition-all duration-300 backdrop-blur-lg group"
            >
                <Globe className="size-6 text-primary group-hover:animate-pulse" />
                <span className="absolute -top-1 -right-1 size-3 bg-primary rounded-full animate-pulse" />
            </button>
        );
    }

    // Expanded state - full widget
    return (
        <aside className="fixed bottom-8 right-8 z-40 hidden xl:block w-72 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-muted border border-border rounded-xl p-4 shadow-2xl backdrop-blur-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Globe className="size-5 text-primary" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-foreground">
                            Global Activity
                        </h5>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                            Live
                        </span>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="size-6 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                        >
                            <X className="size-4 text-muted-foreground hover:text-foreground" />
                        </button>
                    </div>
                </div>

                {/* Map */}
                <div className="relative w-full aspect-4/3 rounded-lg border border-border overflow-hidden mb-4">
                    <Map center={[20, 30]} zoom={0.5} interactive={false}>
                        {globalLocations.map((marker) => (
                            <MapMarker
                                key={marker.id}
                                longitude={marker.longitude}
                                latitude={marker.latitude}
                            >
                                <MarkerContent className="size-1.5 bg-primary rounded-full shadow-[0_0_8px_#00eeff] animate-pulse" />
                            </MapMarker>
                        ))}
                    </Map>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                            Sync Status
                        </span>
                        <span className="text-[10px] font-mono bg-primary/10 px-2 py-0.5 rounded text-primary border border-primary/20">
                            STABLE
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                            Active Nodes
                        </span>
                        <span className="text-[10px] text-foreground font-mono font-bold">
                            {globalLocations.length.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
